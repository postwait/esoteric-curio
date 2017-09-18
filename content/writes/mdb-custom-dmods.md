title: mdb custom dmods
date: 2014-12-08 16:14:11
tags:
- Damaged Bits
- Illumos
- OmniOS
- SmartOS
---

Picking up right where we left off in [our previous exercises](/~jesus/writes/mdb-ctf-dwarf-and-other-angelic-things).
We've got a core due to an error.  We fix the error by removing line 31 from `myprog.c` and
rebuilding.  The program runs now... prints out some text and pauses... to
simulate a long-running program that we need to debug without disrupting too much.

Let's get a core!

```bash session
# UMEM_DEBUG=default ./myprog &
[1] 74502
read 25144 words.
# echo '::gcore' | mdb -p `pgrep myprog`
mdb: core.74502 dumped
# file core.74502
core.74502:	ELF 64-bit LSB core file AMD64 Version 1, from 'myprog'
```

Let's see if it leaking:

``` mdb ::findleaks
; mdb core.74502
Loading modules: [ libumem.so.1 libc.so.1 ld.so.1 ]
> ::findleaks
CACHE             LEAKED           BUFCTL CALLER
000000000044b028      35 00000000005331c0 libc.so.1`strdup+0x25
000000000044d028       5 000000000060f0e0 libc.so.1`strdup+0x25
000000000044d028      40 000000000054bb60 word_get_meta+0x1f
------------------------------------------------------------------------
.          Total      80 buffers, 2000 bytes
```

An estute coder might quickly identify the problem by just reviewing the code,
however, in larger systems this can be far more daunting, so we'll take a
leap of faith and consider this leakage puzzling.

One problem is that we have all of our data up in this hash table and it
is quite challenging to iterate over all of to see what's inside.

Before we dive in and build our own mdb dmod to iterate over a `ck_ht`, let's
take a look at the actual leaks.  Presumably, those leaks via `strdup()` should
have strings in them.  So let's print some out:

```mdb leak print first attmept
> 5331c0::walk leakbuf | ::head -n 1 | /s
0x5316c0:
```

That clearly didn't work. This is some deep carnal knowledge about libumem, but
[umem allocation have a redzone](https://github.com/illumos/illumos-gate/blob/master/usr/src/lib/libumem/common/malloc.c#L89-L118)
and to make it worse, they are of variable size.  Basically, if the allocation is over
16 bytes, the redzone is 16, otherwise it is 8.

In mdb, the only way I know how to walk a set of address and print strings out at
an offset is to hack a silly struct.

```mdb allocations size
> 0x5316c0::whatis
5316c0 is allocated from umem_alloc_16:
            ADDR          BUFADDR        TIMESTAMP           THREAD
                            CACHE          LASTLOG         CONTENTS
          5331c0           5316c0    5e747faccebd6                1
                           44b028                0                0
                 libumem.so.1`umem_cache_alloc_debug+0xfd
                 libumem.so.1`umem_cache_alloc+0xb3
                 libumem.so.1`umem_alloc+0x64
                 libumem.so.1`malloc+0x3f
                 libc.so.1`strdup+0x25
                 add_word+0x23
                 main+0x122
                 _start+0x6c
```

We can see that this came from the `umem_alloc_16` slab, so it is 16 bytes
or less and thus has an 8 byte redzone.  We'll create two types to help us and
then leverage one to print out all 35 leaked words in this `bufctl`.  You'll
notice that the `redzone16` type has its redzone allocated with 10 bytes.
*Everything in mdb is in hex...* 0x10 = 16t.

```mdb redzone hack
> ::typedef "struct { uint8_t redzone[8]; char data[10]; }" redzone8
> ::typedef "struct { uint8_t redzone[10]; char data[100]; }" redzone16
> 5331c0::walk leakbuf | ::print redzone8 data
data = [ "alan" ]
data = [ "xerox" ]
data = [ "woodrow" ]
data = [ "torah" ]
data = [ "tibet" ]
data = [ "ted" ]
data = [ "taft" ]
data = [ "stella" ]
data = [ "sophia" ]
data = [ "satan" ]
data = [ "rabat" ]
data = [ "pyrrhic" ]
data = [ "okay" ]
data = [ "needham" ]
data = [ "muslim" ]
data = [ "messiah" ]
data = [ "max" ]
data = [ "lucy" ]
data = [ "luke" ]
data = [ "lesbian" ]
data = [ "lew" ]
data = [ "kodak" ]
data = [ "kelly" ]
data = [ "jake" ]
data = [ "iceland" ]
data = [ "hayward" ]
data = [ "franco" ]
data = [ "fortran" ]
data = [ "emma" ]
data = [ "cornish" ]
data = [ "chevy" ]
data = [ "flemish" ]
data = [ "camilla" ]
data = [ "amy" ]
data = [ "alfonso" ]
```

Very interesting... what's so special about those words? I didn't just add
lesbian into my output to get more search engine traffic... I was actually a bit
surprised by it.

Now we have more clues and you might likely guess what's so screwed up here.
But, for the sake of more complex debugging, we'll assume we're still completely
stumped and decide we now need to go look in the hash table to see what
is actually there.  This requires some heavy lifting and is more the point of this
post.

### Writing and mdb dmod.

All those fancy commands `::findleaks` and `::walk leakbuf` were provided by
a dmod... libumem's.  Libumem provides some (quite sophisticated) utilities
to mdb via a dmod.  We will use the same approach to teach mdb how to walk
over all the entires in a ck_ht.

This will seem a bit complicated, but remember travesing a data structure might
seem easy when the memory is yours and the pointers point to valid locations
in your memory space.  Here we're in mdb, in it's memory space and have a core
file representing something completely foreign.  We need to go through all
the effort of reading memory out of a foreign virtual memory space.

I'm not going to explain this line by line, but the basic idea is that `mdb_vread`
lets us read bytes of the debugged virtual memory space into our own.  
To make things more complicated (or perhaps realistic) there are bits of
the `ck_ht` structures that we need to look into that aren't exposed by the
public headers... so evil hack time.

A walker is made up of three parts: an initializer, a stepper, and a finalizer.

``` C libck.c
#include <sys/mdb_modapi.h>
#include <ck_ht.h>

/* ck_ht_t and ck_ht_entry are in the header, but struct ck_ht_map is not */
/* We crib this from ck_ht.c and must keep the ABI matching */
struct ck_ht_map {
  unsigned int mode;
  uint64_t deletions;
  uint64_t probe_maximum;
  uint64_t probe_length;
  uint64_t probe_limit;
  uint64_t size;
  uint64_t n_entries;           /*  <-- number of entries used */
  uint64_t mask;
  uint64_t capacity;            /*  <-- number of entries allocated */
  uint64_t step;
  void *probe_bound;
  struct ck_ht_entry *entries;  /*  <-- all the hash table entires */
};
/* end libck sync section */

struct hash_helper {
  int size;
  int bucket;
  ck_ht_entry_t *buckets;
  ck_ht_entry_t *vmem;
};

static int ck_ht_walk_init(mdb_walk_state_t *s) {
  ck_ht_t ht;
  struct ck_ht_map map;
  struct hash_helper *hh;
  void *dummy = NULL;
  if(mdb_vread(&ht, sizeof(ht), s->walk_addr) == -1) return WALK_ERR;
  if(mdb_vread(&map, sizeof(map), (uintptr_t)ht.map) == -1) return WALK_ERR;
  if(map.n_entries == 0) return WALK_DONE;
  hh = mdb_zalloc(sizeof(struct hash_helper), UM_GC);
  hh->size = map.capacity;
  hh->buckets = mdb_alloc(sizeof(ck_ht_entry_t) * map.capacity, UM_GC);
  s->walk_data = hh;
  hh->vmem = (ck_ht_entry_t *)map.entries;
  mdb_vread(hh->buckets, sizeof(ck_ht_entry_t) * map.capacity,
            (uintptr_t)hh->vmem);
  for(;hh->bucket<hh->size;hh->bucket++) {
    if(!ck_ht_entry_empty(&hh->buckets[hh->bucket]) &&
       hh->buckets[hh->bucket].key != CK_HT_KEY_TOMBSTONE) {
      s->walk_addr = (uintptr_t)&hh->vmem[hh->bucket];
      s->walk_callback(s->walk_addr, &dummy, s->walk_cbdata);
      hh->bucket++;
      return WALK_NEXT;
    }
  }
  return WALK_DONE;
}

static int ck_ht_walk_step(mdb_walk_state_t *s) {
  void *dummy = NULL;
  struct hash_helper *hh = s->walk_data;
  if(s->walk_data == NULL) return WALK_DONE;
  for(;hh->bucket<hh->size;hh->bucket++) {
    if(!ck_ht_entry_empty(&hh->buckets[hh->bucket]) &&
       hh->buckets[hh->bucket].key != CK_HT_KEY_TOMBSTONE) {
      s->walk_addr = (uintptr_t)&hh->vmem[hh->bucket];
      s->walk_callback(s->walk_addr, &dummy, s->walk_cbdata);
      hh->bucket++;
      return WALK_NEXT;
    }
  }
  return WALK_DONE;
}

static void ck_ht_walk_fini(mdb_walk_state_t *s) {
  /* We allocated everything with UM_GC, so we have nothing to clean up. */
}

static mdb_walker_t ck_walkers[] = {
  {
  .walk_name = "ck_ht",
  .walk_descr = "walk a ck_ht",
  .walk_init = ck_ht_walk_init,
  .walk_step = ck_ht_walk_step,
  .walk_fini = ck_ht_walk_fini,
  .walk_init_arg = NULL
  },
  { NULL }
};

static mdb_modinfo_t libck_linkage = {
  .mi_dvers = MDB_API_VERSION,
  .mi_dcmds = NULL,
  .mi_walkers = ck_walkers
};

const mdb_modinfo_t *_mdb_init() {
  return &libck_linkage;
}
```

Refering back to the makefile from the previous post, we've got a one line
build for this, which or my system turns out to be:

`gcc -I/opt/circonus/include/amd64 -m64 -fPIC -shared -o libck.so libck.c`

Now, in mdb, we can load this dmod. Note that if you actually placed this
file in `/usr/lib/mdb/proc/amd64`, then it would autoload when mdb realized that
the core linked libck (super nice and convenient). For now, we'll assume it
isn't installed and we need to load it from the local directory.

``` mdb using our dmod
; mdb core.74502
Loading modules: [ libumem.so.1 libc.so.1 ld.so.1 ]
> ::load ./libck.so
> words ::print
{
    m = myprog`ht_allocator
    map = 0x11f8010
    mode = 0x2
    seed = 0x3df1b661
    h = libck.so.0.4.2`ck_ht_hash_wrapper
}
```

Cool... but actually that just comes from CTF.  I did that to emphasize that
the `map` element of that structure actually holds all the goodies and because
libck itself was built without CTF, we can't see shit. There are
a lot of words in this hash, so I'll just walk it and count them and then
print out the first few.  Again we need to pull a stupid trick to print out
C strings via `::print`

```mdb hash walking
> words ::walk ck_ht !wc -l
   25104
> ::typedef "struct { char data[100]; }" cstring
> words ::walk ck_ht | ::head -n 5 | ::print ck_ht_entry_t key | ::print cstring data
data = [ "sangaree" ]
data = [ "meat" ]
data = [ "cow" ]
data = [ "quietus" ]
data = [ "professorial" ]
```

Okay, we've got words in there. While not so useful for debugging, let's print
out the value in the hash table to see if we can keep our sanity.  The first
word there is "sangaree", so let's see if the meta data about its length, etc.
is correct.

```mdb mdb print word_meta
> words ::walk ck_ht | ::head -n 1 | ::print ck_ht_entry_t value | ::print struct word_meta
{
    length = 0x8
    lowers = 0x8
    caps = 0
}
```

Interesting... caps is zero (obviously), but I've not yet seen any capitalized
words. Let's print all the caps...

```mdb caps values
> words ::walk ck_ht | ::print ck_ht_entry_t value | ::print struct word_meta caps !sort | uniq -c
25104 caps = 0
```

No caps. Anywhere. Looking at the code, maybe that's the issue! We're
lowercasing all the words.

I wonder if any of our freed words are still in the hash table. One of our
other interesting leaked words was "fortran".

```mdb mdb looking for fortran
> words ::walk ck_ht | ::print ck_ht_entry_t key | ::print cstring data !grep fortran
data = [ "fortran" ]
```

Hot damn! So we have a leaked "fortran" and a not leaked "fortran."  We have
two "fortan"s. As any C programmer will tell you, the only acceptable number
of fortans is zero, but as a small hat tip to the mathematicians in the croud
and we'll allow one. Two? Bad mojo.

If we put a duplicate value into the hash table, we'll replace the old one
without freeing it... thus our leaks.

If we go look in `/usr/dict/words`, we'll find both "Fortan" and "fortan"
there.  Personally, I'm all for removing both of them.  While I'm puzzled
as to why there are two lesbians in my dictionary, I do understand that
both "Max" (the proper noun) and "max" (the short form of maximum) would both
legitimately be there.
