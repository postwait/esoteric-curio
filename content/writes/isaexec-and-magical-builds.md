---
title: "isaexec and magical builds"
date: 2005-06-10 02:07:29
type: post
categories:
- Damaged Bits
tags:
- solaris
- illumos
---

<p> We do alot of software builds on various Solaris versions.  One thing we find frustrating is that during a typical build process many processes are invoked via shell scripts and makefiles etc and isaexec takes over for all the multi-architecture packages -- it's bad. </p> <p> So... say I'm building a a software product (and of course are rolling sparcv8, sparcv9, i386, and amd64). By simply setting the compiler flags and linker flags appropriately and we can get our binaries for the appropriate architecture.  However, suppose we also bundle some compiled perl modules (XS based).  During the build process, we will call out to the installed perl to get the build flags and here we run into the problems...</p>  <p>When we call out to perl (assuming we have a multi-architecture perl installed, e.g. supporting sparcv8 and sparcv9), then isaexec will always run the "best."  Well! I don't want that.  I'm trying to do a sparcv8 build and I'd really prefer <b>all</b> of my build tools to run as sparcv8 is possible.</p>  <p>Now, as far as I can tell, there is no Sun-prescribed way of accomplishing this.  With a small replacement of isaexec on the system, we can have it respect an environment variable...</p>  <p>Here at OmniTI we wrote a tiny replacement for isaexec that respects the ISALIST environment variable and uses the intersection of that with the results of the system's sysconf SA_ISALIST to power  an isaexec-like replacement. What does that get us?</p>  <p>Now, for large, multiphase build processes, we can set ISALIST to sparcv8 and kick it off -- without the worry of sub-tools that utilize /usr/lib/isaexec to operate in the instruction set space we want.</p>
