title: .SUNW_cap arcana
date: 2017-02-28 10:16:55
tags:
- illumos
- linker
---

This post is going to be useless to almost everyone, yet hopefully
eye opening and fascinating.  Mostly, the purpose is so that I don't
have to discover this for the third time and can, at some later date,
Google this, find my own article, and simply read about it.

This is a tale of linkers and code optimization and perhaps the most
elegant ELF loader magic I've ever seen.

## Backgrounder

Modern processors are pretty badass. They can do amazing things. The new
Intel chips on the horizon will have a single instruction for computing
a SHA256 hash (or so I'm led to believe).  The various magical
instructions (or classes of instructions) you can issue on a current
64-bit Intel or AMD chip are mind boggling.  However, if you are shipping
binaries to be run somewhere and you leverage these instructions you
stand to malfunction on older systems that don't support it.

A simple example is the cx16 set of instructions that allow the atomic
comparing and swapping of 16 bytes of data (two 8-byte pointers).  This
instruction affords the programmer the tooling to build some powerful
lockless datastructures. So, as a packager you want everyone to have the
best they can, but not everyone has the same chips, so what to do?

OpenSSL solves this issue by compiling several implementations of a given
hot function (from hand-coded assembly), names them different things and
at startup will check the CPU identifier to map out what it can and can't
do.  This is effective, but suboptimal b/c the entry into these functions
is riddled with branches based on this variable capability set.  If you
look at other software, the vast majority simply ship the lowest common
denominator and wash their hands of it.  In the open source world, it
would be up to you to compile an optimized copy for yourself; the whole
Gentoo community has been the butt of this joke for some time:
`-funroll-loops`!

## Operating Systems

Operating systems run on processors, of course. It stands to reason that if
an application can check a set of CPU capabilities, then the operating
system can as well.  On Linux this is exposed via `/proc/cpuinfo`, but
on Illumos, you can run the command `isainfo -v` to see what your
processors are capable of.  This is from a VM on my laptop:

```
; isainfo -v
64-bit amd64 applications
        rdrand avx xsave pclmulqdq aes movbe sse4.2 sse4.1 ssse3 popcnt
        tscp cx16 sse3 sse2 sse fxsr mmx cmov amd_sysc cx8 tsc fpu
32-bit i386 applications
        rdrand avx xsave pclmulqdq aes movbe sse4.2 sse4.1 ssse3 popcnt
        tscp ahf cx16 sse3 sse2 sse fxsr mmx cmov sep cx8 tsc fpu
```

And this is from a production server here:

```
; isainfo -v
64-bit amd64 applications
        avx2 fma bmi2 bmi1 rdrand f16c vmx avx xsave pclmulqdq aes movbe
        sse4.2 sse4.1 ssse3 popcnt tscp cx16 sse3 sse2 sse fxsr mmx cmov
        amd_sysc cx8 tsc fpu
32-bit i386 applications
        avx2 fma bmi2 bmi1 rdrand f16c vmx avx xsave pclmulqdq aes movbe
        sse4.2 sse4.1 ssse3 popcnt tscp ahf cx16 sse3 sse2 sse fxsr mmx
        cmov sep cx8 tsc fpu
```

You'll note that while largely the same, the production server can do some
things that my laptop cannot:
[AVX2 instructions](https://software.intel.com/en-us/node/523876),
[FMA instructions](https://en.wikipedia.org/wiki/FMA_instruction_set),
and [F16C instructions](https://en.wikipedia.org/wiki/F16C) to name a few.

So, if the operating system knows that they are there and the operating
system is responsible for running my binaries, could it assist in selecting
the right code to run at link-time{% sidebar-link ldso1 %} instead of
during run-time?

{% sidebar ldso1 %}
##### A bit about linking

Typically people think of linking as the stage at which you produce binaries
or shared objectes from object files as the last step of compiling an
application.  Dynamic linking also happens are load time.  When an ELF
binary is loaded, the runtime linker (ld.so.1) lays it out in memory and
applies quite a few sophisticated techniques during the act. So, herein
I'm referring to the run-time linker arcana.
{% endsidebar %}

## ELF

ELF stands for "Executable and Linking Format" and is the predominant
specification adhered to by modern UNIX platforms (Mac OS X being the
standout exception).  It is a robust format for laying out all things
important to a binary (or shared library) such that they can be
assembled into a running process within UNIX.  Herein, `elfdump` is
your best friend.

```
; elfdump -e libfoo.so

ELF Header
  ei_magic:   { 0x7f, E, L, F }
  ei_class:   ELFCLASS64          ei_data:       ELFDATA2LSB
  ei_osabi:   ELFOSABI_SOLARIS    ei_abiversion: EAV_SUNW_CURRENT
  e_machine:  EM_AMD64            e_version:     EV_CURRENT
  e_type:     ET_DYN
  e_flags:                     0
  e_entry:                     0  e_ehsize:     64  e_shstrndx:  23
  e_shoff:                0x12d0  e_shentsize:  64  e_shnum:     24
  e_phoff:                  0x40  e_phentsize:  56  e_phnum:     5
```

> While this ELF library is clearly a "Solaris" ELF binary, because ELF
> is a standard format, Linux can read these just fine.  Also, Illumos
> can read Linux ELF binary objects.

The various sections of the ELF help the linker understand where symbols
are located (which is a lot more complicated than one might expect).
Here's where it gets interesting.  The Sun linker (now the Illumos linker)
has support for creating (object link-editor) and interpretting
(run-time linker) a set of sections around system and object capabilities.
I shall refer to these sections as the `.SUNW_cap`{% sidebar-link capinfo %} sections.

{% sidebar capinfo %}
##### .SUNW_cap
There are actually 3 relevant sections: .SUNW_cap, .SUNW_capinfo, .SUNW_capchain; and two supporting sections: .SUNW_capchainsz and .SUNW_capchainent.
{% endsidebar %}

The capabilities section allows a developer to "name" capabilities that
describe certain software or hardware requirements.  For example, a
developer could name a capability "avx2" that requires the the AVX2
instruction set be available.  To see this section, the Illumos provided
`elfdump` accepts a `-H` parameter.  Before I can jump into this, let's
look at some code for reference.

## A sample project

Let's provide a shared library `libfoo.so` that provides a `foo()` function
that can potentially be optimized for different available processor
capabilites.

```c
#include <stdio.h>

int foo() {
#ifdef SIMPLE
  fprintf(stderr, "Simple foo...\n");
#endif
#ifdef AVX
  fprintf(stderr, "AVX foo...\n");
#endif
#ifdef AVX2
  fprintf(stderr, "AVX2 foo...\n");
#endif
  return 0;
}
```

> Note that in most systems when something is optimized for a specific
> instruction set, it is done so with hand-coded assembly.  Yet, in
> general, this isn't a strict requirement.  One could simply recompile
> the same source file with `-mavx2` in the case of AVX2 optimizations
> and the compile will elect to use AVX2 instructions where it sees fit.
> The described techniques work in seamlessly in this scenario as well.

Here we have a function foo and three sets of "optimizations" for the
purpose for testing only.  In order to build these three differently
optimized objects we can compile them as such:

```
; gcc -DSIMPLE -fPIC -m64 -o foo.lo -c foo.c
; gcc -DAVX -fPIC -m64 -mavx -o foo.avx-o -c foo.c
; gcc -DAVX2 -fPIC -m64 -mavx2 -o foo.avx2-o -c foo.c
```

## Unearthed Arcana

By diving deeply into the Solaris Linker and Libraries Guide we can
find obscure mentions regarding the .SUNW_capchain.  I personally
found them to be enough to begin discovery, but riddled with
significant experimental failure (hence this blog post).

Right now, the three object files we created have different names, different
code, but identical symbol names.  So, if we attempted to link them
together, we'd get collisions.  Here enters Illumos ld, the mapfile, and
an option they managed to leave out of `ld --help` and the man page!

#### Step 1. mark our objects.

We need to define a set of capabilities called "avx" and another
called "avx2." For that we will create two separate linker mapfiles:

##### mapfile_avx
```
$mapfile_version 2
CAPABILITY "avx"
{
  HW += AVX;
};
```

##### mapfile_avx2
```
$mapfile_version 2
CAPABILITY "avx2"
{
  HW += AVX2;
};
```

And we will use the link editor to map the symbols.

```
; ld -r -o foo.avx-lo -M mapfile_avx foo.avx-o
; ld -r -o foo.avx2-lo -M mapfile_avx2 foo.avx2-o
```

If we attempt to dump the capabilities header for our optimized
`foo.avx-o` using `elfdump -H foo.avx-o` there is no output (because
there is no .SUNW_cap header.  And while both `foo.avx-o` and `foo.avx-lo`
both have the foo function, only one has the capabilities information.

```
; nm -e foo.avx-o | grep foo
foo.avx-o:
[8]     |           0|          47|FUNC |GLOB |0    |1      |foo
; nm -e foo.avx-lo | grep foo
foo.avx-lo:
[15]    |           0|          47|FUNC |GLOB |0    |3      |foo
; elfdump -H foo.avx-o
; elfdump -H foo.avx-lo

Capabilities Section:  .SUNW_cap

 Object Capabilities:
     index  tag               value
       [0]  CA_SUNW_ID       avx
       [1]  CA_SUNW_HW_1     0x20000000  [ AVX ]
```

The same holds for the `avx2` variants we've created.

#### Step 2. Alter our symbols

The (undocumented) ld option `-z symbolcap` will take the .SUNW_cap header
from an object and fold the capabilities naming into the symbol names and
annotate the chain to include that there is an available symbol with that
stated capability.

```
; ld -r -o foo.avx-cap-lo -z symbolcap foo.avx-lo
; ld -r -o foo.avx2-cap-lo -z symbolcap foo.avx2-lo
```

These new objects have altered symbols and all the .SUNW_cap(chain)
section information they need to be linked together.

```
; elfdump -H foo.avx-cap-lo

Capabilities Section:  .SUNW_cap

 Symbol Capabilities:
     index  tag               value
       [1]  CA_SUNW_ID       avx
       [2]  CA_SUNW_HW_1     0x20000000  [ AVX ]

  Symbols:
     index    value              size              type bind oth ver shndx          name
      [17]  0x0000000000000000 0x000000000000002f  FUNC LOCL  D    0 .text          foo%avx

; elfdump -H foo.avx2-cap-lo

Capabilities Section:  .SUNW_cap

 Symbol Capabilities:
     index  tag               value
       [1]  CA_SUNW_ID       avx2
       [2]  CA_SUNW_HW_2     0x20  [ AVX2 ]

  Symbols:
     index    value              size              type bind oth ver shndx          name
      [17]  0x0000000000000000 0x000000000000002f  FUNC LOCL  D    0 .text          foo%avx2
```

#### Step 3. Link it all together.

Now, you'll note we never did anything special with our `foo.lo` artifact.
That is just a plain old ELF object ready to be linked.  We can link our
three (plain, avx, and avx2) objects together into a shared library now.
We could use `gcc -shared` to do this, but since we've been using `ld`
directly this whole time, I'll show how to do that with `ld`:

```
ld -G -o libfoo.so foo.lo foo.avx2-cap-lo foo.avx-cap-lo
```

We now have a `libfoo.so` that applications can use.  Let's try it out.

## Testing.

Let's create a tiny test program that calls foo.

```
extern int foo();
int main() { return foo(); }
```

Link it.

```
gcc -m64 -o test test.c -L. -R. -lfoo
```

> We set a run path of '.' to avoid needing to set `LD_LIBRARY_PATH`.
> The '-R' would be unnecessary if this library were installed in a system path.

Run it.

```
; ./test
AVX foo...
```

Now, if I copy the same binaries (`test` and `libfoo.so`) up to my
production server:

```
./test
AVX2 foo...
```

## Understanding the Magic.

The `ld.so.1` man page talks briefly about the `LD_DEBUG` environment
variable, but for your own fun, just run any command (say /bin/true) with
`LD_DEBUG=help /bin/true` for a good time!  Online debugging for the
run-time linker. `cap` is a valid `LD_DEBUG` value.  Let's run test
with `cap` debugging:

```
; LD_DEBUG=cap ./test
debug:
debug: Solaris Linkers: 5.11-1.1750 (illumos)
debug:
12412:
12412: platform capability (CA_SUNW_PLAT) - i86pc
12412: machine capability (CA_SUNW_MACH) - i86pc
12412: hardware capabilities (CA_SUNW_HW_2) - 0x3f
12412: hardware capabilities (CA_SUNW_HW_1) - 0x7bd55c77
12412:
12412: 1:
12412: 1: transferring control: test
12412: 1:
12412: 1:   symbol=foo[7]:  capability family default
12412: 1:   symbol=foo%avx2[1]:  capability specific (CA_SUNW_HW_2):  [ 0x20  [ AVX2 ] ]
12412: 1:   symbol=foo%avx2[1]:  capability candidate
12412: 1:   symbol=foo%avx[2]:  capability specific (CA_SUNW_HW_1):  [ 0x20000000  [ AVX ] ]
12412: 1:   symbol=foo%avx[2]:  capability candidate
12412: 1:   symbol=foo%avx2[1]:  used
AVX2 foo...
```

The system has two HW capabilities profiles.  It notices the current
capabilities at ld.so.1 invocation time and then applies them to
the loading of `libfoo.so` and selects the best matching profile.

## Summary

This method provides a fantastic way to build and ship both optimized and
non-optimized variants in the same binary.  This makes debugging easier
as you have less binary artifacts to wrangle and the symbols in the
stacktraces are clearly annotated with the `%variant` names.

The only downside to this approach is that the Linux run-time linker and
toolchain don't support it.  Viva la Illumos.
