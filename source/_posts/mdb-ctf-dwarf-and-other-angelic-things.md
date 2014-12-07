title: MDB, CTF, DWARF, and other angelic things
date: 2014-12-05 22:56:15
tags:
- Damaged Bits
- code
- Illumos
- OmniOS
- SmartOS
---

So what's this all about then? Debugging. I've written a lot of C, I still
write a lot of C and I sure as hell end up debugging a lot of C. One thing
that pisses me off is when I've got a core file, but I've no idea about
the exact version or build of the ELF binary that produced it. The bottom
line is that I still need to find the failure.  Luckily, I've got mdb.

mdb is the Illumos Modular Debugger{% sidebar-link mdb %}.
It was originally designed to make
debugging kernel issues easier, but it turns out it has some serious mojo
up in user-space as well. Unfortunately, we'll also find it has some
significant shortcomings too.
{% sidebar mdb %}
### Origins
In 1997, faced with the daunting task of porting Steve Bourne's adb
debugger to 64-bit architetures supported in Solaris 7, Mike Shapiro
and others at Sun Microsystems started developing mdb.

### MDB on OmniOS
The `mdb` command is available in package `developer/debug/mdb`
{% endsidebar %}

First and foremost, mdb is not a source debugger. It doesn't know anything
about your code. You won't find back traces with line numbers or source
code listings.  What's more, you won't even find your stack variables
exposed. How is this still useful? Well, when all you've got is a core,
useful is as useful does... and it turns out it has some pretty damn fine
extensibility.

### Compressed Type Format

Before we dive into the awesomeness of mdb, we're going to be pretty damn
disappointed if we didn't build our binaries right.  My hope is that in
the very near future, the Illumos linker will do all of this magically
for you, but for now we have to roll up our sleeves and get CTF into
our binaries.

CTF (or Compressed Type Format) is basically definitions of data types and
functions that orther tools (like mdb and DTrace) can understand.  While
I won't go into DTrace here, if you put CTF in your binaries, you'll win
big over on the DTrace front also.

If CTF sounds a bit like the information provided in DWARF debugging
sections, it is because it is a subset. Why didn't the tools builders
just use DWARF?  I've decided that it's just because they're assholes.
Okay, maybe not, but I don't have a real reason and that one sounds both
funny and quite believable.

We're going to put CTF into our binaries from the DWARF itself using
the ctfconvert and ctfmerge tools{% sidebar-link ctftools %}.  In the
process, we'll be careful to leave the DWARF debugging information
intact so that if we have the opportunity to pop into a source debugger
(like gdb or dbx) we'll have all the fancy line numbers and variables
from our stack frames.

{% sidebar ctftools %}
### Tools on OmniOS
The `ctfconvert` and `ctfmerge` tools are hidden away in
`/opt/onbld/bin/i386/` and provided by the
`developer/build/onbld` package.
{% endsidebar %}

In order to explore further, I need a program to debug.  Instead of using
a large and complex program, I'm going to write a "small" one that has a
few bugs and look at using these tools to diagnose the issues. Every program
you every build on an Illumos-based distribution should link against
libumem{% sidebar-link libumem %}.  I've written of [finding memory leaks
with libumem](/~jesus/writes/finding-leaks-on-solaris-wo-valgrind) before.

{% sidebar libumem %}
### libumem
Umem is a high-performance slab-base memory allocated that replaced
malloc and free (etc.) via their weak symbol linkage.  If you link
libumem (or even LD_PRELOAD it) you get its wonderful malloc instead of
the systems default allocators.  In addition to being more scalable (across
many cores) it has advanced debugging features to help pinpoint memory
misuse and leakages.
{% endsidebar %}

The program will read all of the words in the dictionary and store them in
a hash table along side some metadata about their length an the number of
capital vs. lowercase letters in them.  Simple, pointless, but resembles
real and useful code in that it allocates memory and puts it in a data
structure.

For our hash table implementtion, I'll use the excellent
one from [Concurrency Kit](http://www.concurrencykit.org/).

First our Makefile:

``` Makefile Makefile
CC=gcc
CPPFLAGS=
CFLAGS=-m64
LDFLAGS=-m64
LIBS=-lck -lumem
CTFCONVERT=ctfconvert
CTFMERGE=ctfmerge
OBJS=myprog.o

all:    myprog libck.so

.c.o:
        $(CC) $(CPPFLAGS) $(CFLAGS) -g -c $< -o $@
        $(CTFCONVERT) -g -l 0 $@

myprog: $(OBJS)
        $(CC) $(LDFLAGS) -o $@ $(OBJS) $(LIBS)
        $(CTFMERGE) -g -l 0 -o $@ $(OBJS)

libck.so:       libck.c
        $(CC) $(CPPFLAGS) $(CFLAGS) -fPIC -shared -o $@ libck.c

clean:
        rm -rf *.o myprog libck.so
```

Next our program:

``` C myprog.c
#include <stdio.h>
#include <unistd.h>
#include <strings.h>
#include <signal.h>
#include <stdlib.h>
#include <assert.h>
#include <ck_ht.h>

ck_ht_t words;

static void * ht_malloc(size_t r) { return malloc(r); }
static void ht_free(void *p, size_t b, bool r) { free(p); }
static struct ck_malloc ht_allocator = {
  .malloc = ht_malloc,
  .free = ht_free
};

struct word_meta {
  int length;
  int lowers;
  int caps;
};

void word_get_meta(char *w, struct word_meta **metaptr) {
  char *cp;
  struct word_meta *meta = calloc(sizeof(*meta), 1);
  meta->length = strlen(w);
  for(cp = w; *cp; cp++) {
    if(*cp >= 'a' && *cp <= 'z') meta->lowers++;
    else if(*cp >= 'A' && *cp <= 'Z') meta->caps++;
    else return;
  }
  *metaptr = meta;
}

void add_word(char *word, struct word_meta *meta) {
  char *copy;
  ck_ht_entry_t entry;
  ck_ht_hash_t hv;
  copy = strdup(word);

  ck_ht_hash(&hv, &words, copy, strlen(copy));
  ck_ht_entry_set(&entry, hv, copy, strlen(copy), meta);
  ck_ht_put_spmc(&words, hv, &entry);
}

void free_words() {
  ck_ht_entry_t *cursor;
  ck_ht_iterator_t iterator = CK_HT_ITERATOR_INITIALIZER;
  while(ck_ht_next(&words, &iterator, &cursor)) {
    free(ck_ht_entry_key(cursor));
    free(ck_ht_entry_value(cursor));
  }
}

static void noop(int sig) { (void)sig; }

int main() {
  int read_words = 0;
  FILE *fp;
  char buff[80];
  struct timeval now;
  struct word_meta *meta = NULL;

  signal(SIGINT, noop);
  gettimeofday(&now, NULL);
  srand48(now.tv_usec << 10 | getpid());
  assert(ck_ht_init(&words, CK_HT_MODE_BYTESTRING, NULL, &ht_allocator,
                    1024, lrand48()));

  assert((fp = fopen("/usr/dict/words", "r")) != NULL);
  while(fscanf(fp, "%s", buff) != EOF) {
    /* lowercase word */
    char *cp;
    for(cp = buff; *cp; cp++) *cp = tolower(*cp);
    word_get_meta(buff, &meta);
    add_word(buff, meta);
    read_words++;
  }
  fclose(fp);

  printf("read %d words.\n", read_words);

  pause(); /* simulate a daemon just waiting for more work */
  free_words();
  return 0;
}
```

Now, we compile it and run it and the bugs will come nibbling at us:

``` bash shell
# make myprog
gcc -m64 -g -c myprog.c -o myprog.o
ctfconvert -g -l 0 myprog.o
gcc -m64 -o myprog myprog.o -lck -lumem
ctfmerge -g -l 0 -o myprog myprog.o
# UMEM_DEBUG=default ./myprog
read 25144 words.
^C    ### I hit CTRL-C here.
[1]    33040 IOT instruction (core dumped)  ./myprog
# file core
core:		ELF 64-bit LSB core file AMD64 Version 1, from 'myprog'
```

Remember the goal here is to be able to diagnose the failure wihtout the
binary `myprog`. So, let's get start in mdb and check why we crashed and
get a stack trace.

``` bash mdb session
# mdb core
Loading modules: [ libumem.so.1 libc.so.1 ld.so.1 ]
> ::status
debugging core file of myprog (64-bit) from noitdev
file: /export/home/jesus/bp/myprog
initial argv: ./myprog
threading model: native threads
status: process terminated by SIGABRT (Abort), pid=49408 uid=501 code=-1
> ::stack
libc.so.1`_lwp_kill+0xa()
libc.so.1`raise+0x20(6)
libumem.so.1`umem_do_abort+0x44()
0xfffffd7ff4fc4495()
libumem.so.1`process_free+0xa0(179cf90, 1, 0)
libumem.so.1`free+0x1d(179cf90)
free_words+0x42()
main+0x173()
_start+0x6c()
>
```

Now, you'll notice we dont't have line numbers here.  We've got code...
machine code... real code.  We see that we died trying to free `0x179cf90`
in `free()` call from 0x42 bytes into the `free_words` function.  We can
disassemble that easily enough:

``` mdb mdb disassembly
> free_words+0x42 ::dis
free_words+0x1a:                movq   -0x8(%rbp),%rax
free_words+0x1e:                movq   %rax,%rdi
free_words+0x21:                call   -0x2dc   <ck_ht_entry_key>
free_words+0x26:                movq   %rax,%rdi
free_words+0x29:
call   -0x2404  <PLT=LMfffffd7fff3407c8`libumem_trampoline.so.1`free>
free_words+0x2e:                movq   -0x8(%rbp),%rax
free_words+0x32:                movq   %rax,%rdi
free_words+0x35:                call   -0x2cd   <ck_ht_entry_value>
free_words+0x3a:                movq   %rax,%rdi
free_words+0x3d:
call   -0x2418  <PLT=LMfffffd7fff3407c8`libumem_trampoline.so.1`free>
free_words+0x42:                leaq   -0x8(%rbp),%rdx
free_words+0x46:                leaq   -0x20(%rbp),%rax
free_words+0x4a:                movq   %rax,%rsi
free_words+0x4d:                movl   $0x418fc0,%edi   <myprog`words>
free_words+0x52:                call   -0x23dd  <PLT=libck.so.0.4.2`ck_ht_next>
free_words+0x57:                testb  %al,%al
free_words+0x59:                jne    -0x41    <free_words+0x1a>
free_words+0x5b:                leave
free_words+0x5c:                ret
main:                           pushq  %rbp
main+1:                         movq   %rsp,%rbp
```

So, now it is clear this free call the attempting to free the hash value,
not the key.  We might have been able to find the information out from
libumem by asking what it knows about the `0x179cf90` pointer we tried to free:

``` mdb ::whatis
> 179cf90::whatis
179cf90 is 179cf80+10, freed from umem_alloc_32:
            ADDR          BUFADDR        TIMESTAMP           THREAD
                            CACHE          LASTLOG         CONTENTS
         179f700          179cf80    5e6279aa5fbc6                1
                           44c028                0                0
                 libumem.so.1`umem_cache_free_debug+0x10c
                 libumem.so.1`umem_cache_free+0x56
                 libumem.so.1`umem_free+0xf6
                 libumem.so.1`process_free+0x145
                 libumem.so.1`free+0x1d
                 free_words+0x42
                 main+0x173
                 _start+0x6c

>
```

This is may seem confusing at first becahse it actually looks like our stack trace.
You might think, "well duh, I just freed it there, so of course."  But we didn't free
it, we crashed because we failed to free it.  This stack is umem telling us that the
buffer we attempted to free was *previously* freed at the above stack trace.  This is
clearly a double free.

Since we know that this allocation should have been of type `struct word_meta`, we can
attempt to print it.  An this is where CTF comes in... mdb doesn't have the binary, it
doesn't have the source code, yet it know about the types.

``` mdb mdb ::print
> 179cf90::print struct word_meta
{
    length = 0xdeadbeef
    lowers = 0xdeadbeef
    caps = 0xdeadbeef
}
```

As expected, it has been `0xdeadbeef`'d from the previous free.  Double free confirmed.
This rather obvious bug (in `word_get_meta`) is left as an exercise to the reader.

We have some memory leaks in this... which I'll tackle in the
[next post](/~jesus/writes/mdb-custom-dmods).  The `libck.so`
makefile target should be foreshadowing for the advanced programmer.

