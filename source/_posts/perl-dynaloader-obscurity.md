title: perl DynaLoader obscurity
date: 2005-08-10 20:02:18
---

<p>While I rarely write about obscure encouters I have with perl -- as most are rather obscure anyway, this one is a deviation from most established docs, so I thought I'd share.</p>

<p>Splitting up an XS file into multiple XS files and chaining their bootstraps can cause perl to segfault... I just followed the directions here: <a href="http://perlpod.com/5.9.1/lib/ExtUtils/MakeMaker/FAQ.html">MakeMaker FAQ</a>.
</p>

