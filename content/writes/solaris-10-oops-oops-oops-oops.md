---
title: "Solaris 10 oops. oops. oops. oops."
date: 2006-01-24 04:44:04
type: post
categories:
- Damaged Bits
tags:
- solaris
---

<p>So, I used dtrace to diagnose a pretty subtle performance problem with Ecelerity a while ago and just got around to implementing an enhancement to obviate that bottleneck.  This would be asynchronous socket shutdowns and closes under situations that were "challenging" before.</p>  <p>I built out a generalized asynchronous socket shutdown and close framework and deployed it throughout the application.  On Solaris, our event system now handles the socket() calls, the port_associates() and port_diassociates(), read/write/readv/writev/send/recv/etc.  However, now in all possible places we asynchronous the shutdown() and close() to other threads to avoid some minor performance issues.  Basically, the same thing the lingerd patch to Apache does.</p>  <p>However...  I launched the new code in our test environment and BOOM!</p>  <pre> # mdb unix.2 vmcore.2 Loading modules: [ unix krtld genunix specfs ufs ip sctp usba fctl nca lofs nfs random ipc crypto sppp ] > ::stack vpanic(fe96c300) turnstile_block+0x2ff(d07ea5f0, 0, d5a07700, fec022f8, 0, 0) mutex_vector_enter+0x2d4(d5a07700) getf+0x3f(3dc) port_dissociate_fd+0x42(d3842180, 3dc) portfs+0x131() sys_sysenter+0xdc() </pre>  and  <pre> # mdb unix.5 vmcore.5 Loading modules: [ unix krtld genunix specfs ufs ip sctp usba fctl nca lofs nfs random ipc crypto sppp ] > ::stack vpanic(fe96c300) turnstile_block+0x2ff(d07be000, 0, d2188348, fec022f8, 0, 0) mutex_vector_enter+0x2d4() port_close_pfd+0x2f(d43742c0) port_close_fd+0x58(d43742c0, 45) closeandsetf+0x2db(45, 0) close+0xd() sys_sysenter+0xdc() </pre>  <p>6 panics in 60 minutes.  Yikes?!  Time to call Sun on the tele.</p>
