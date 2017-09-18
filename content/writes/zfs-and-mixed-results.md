---
title: "ZFS and mixed results"
date: 2006-08-27 00:58:45
type: post
categories:
- Damaged Bits
tags:
- zfs
---

We've had great luck with ZFS on some "largish" systems.  I haven't worked out how to blog about them yet as they contain a lot of client specifics, but I now have ZFS in a happy place of my mind.  However, most of the stuff we do doesn'ts go over NFS.  So, Eric (who leads out operations group) was tasked to solve some heterogenous home dir issues across a large build cluster we have at the $DAYJOB.  <a href="http://www.nanobyte.org/blog/index.php?/archives/7-Economical-Shared-Home-Directories-with-Solaris-and-ZFS.html">His experience with NFS on ZFS</a> wasn't so golden as mine.  It didn't turn out all bad, but it's really good to know the pitfalls before you start a project -- so read up.
