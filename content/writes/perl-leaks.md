title: perl leaks
date: 2005-08-26 00:47:00
---

<p>There's Perl... then there's perl.</p> <p>Perl seems like a very expressive, arguably elegant, extremely powerful language on the surface.  In fact it is.  However, under the hood it's down-right scary.  man perlguts, perlembed, perlapi, perlxs, perliol just for starters.</p> <p>For people embedding perl in other apps, or writing perl extensions in C, things get hair quick.  Perl's internals don't have the benefit of an advanced garbage collector (like some other interpretted languages).  Instead, it uses stacks, heaps and reference counting.  This means, if you aren't perfect, you leak.  And with perl, leaks are scary and will ultimately cause your long running application to bust at the seams.</p> <p>There are some tools to track these leaks, but none were instrumented as I needed... I needed something more powerful.</p>
