---
title: "Varnish, get your patch on."
date: 2008-08-11 01:50:00
type: post
categories:
- Damaged Bits
---

<p><a href="http://varnish.projects.linpro.no/">Varnish</a> is a "bad ass" new HTTP caching accelerator.  It's developed by <a href="http://www.freebsd.org/doc/en_US.ISO8859-1/books/faq/misc.html#BIKESHED-PAINTING">some crufty old BSD hacker</a> and has a lot of Linux users.  By and large, it has ignored Solaris.  This sort of neglect isn't malicious, it is just neglect... you know: "out of sight, out of mind."</p>  <p>Well, check out <a href="http://varnish.projects.linpro.no/svn/trunk/varnish-cache/">Varnish trunk</a> and give <a href="http://lethargy.org/%7Ejesus/misc/varnish-solaris-trunk-3071.diff">this patch</a> a spin.  Let me know what you think.</p>  <p>Perhaps one day, the Solaris networking team (or someone else) will satisfy this pretty abysmal shortcoming: <a href="http://bugs.opensolaris.org/view_bug.do?bug_id=4641715">BugID 4641715</a>.</p>
