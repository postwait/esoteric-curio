---
title: "LVM2, if you can't grok snapshots, don't back them up!"
date: 2005-08-11 13:02:40
type: post
---

<p>So, routine mainenance, kernel upgrade, reboot.  It's a Linux box...</p>  <p>Reboots without half terabyte storage system mounted.  It's managed under LVM2 and I expect a /dev/maildata/spool file... Nope.</p>  <p>I've had some scary run ins with LVM, but have yet to loose anything.  MD (metadevice stuff under Linux) is a whole other story, I've had it "do thing" that it shouldn't have and lost hosts of data.  I don't like md.  So, with confidence, let's see if we can't tackle this LVM2 issue...</p>
