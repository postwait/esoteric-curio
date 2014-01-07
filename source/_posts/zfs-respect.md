title: ZFS. Respect.
date: 2008-04-23 03:16:32
---

<p>Today someone asked me: "You speak about ZFS a lot.  I know other people that talk about the latest filesystems with praise, but generally speaking they just don't have much to offer.  Is ZFS that different?"</p>

<p>My answer is "yes."  But, of course, I can't leave it at that.  I'm not going to make a performance argument -- ZFS is fast in some cases and slow in others -- just like everything else.  I think one of the things we've seen in the last 10 years is that everyone felt the need to come out with their own filesystem -- at least on Linux.  So, you have to as yourself why.  My personal opinion is that filesystems on Linux suck.</p>

<p>Most filesystems on the market support snapshots.  No open source filesystems on Linux (that I'm aware of) support snapshots.  Of course, you can use LVM to do block-level snapshots.  First off, that's a pain in the ass w.r.t. storage provisioning.  Other systems make the process of allocating and managing snapshots "not my problem." (simple and easy).  Let's be frank, ext2 and ext3 are nothing to write home about. reiserfs, xfs, jfs, the list goes on and on.</p>

<p>There are a few closed-source filesystems that are really nice.  Specifically Veritas Filesystem (VxFS) and its excellent layered volume manager VxVM which appears to have heavily inspired geom on FreeBSD.  DEC thought it was so cool that they pulled it white-label into Tru64.  Respect.</p>

<p>So, what makes ZFS so different?  ZFS is a disruptive technology as it abolishes the sacred line in the sand between block devices, volume management and filesystems.  This means it just make storage management easy.  When I say easy... I mean <b>easy</b>.</p>

<p>So you want more space?  Add more disks.  Want to move from from failing disks to replacements?  Tell zfs to add the new ones and tell it to remove the old ones.  Read that report by Google about disk errors?  ZFS checksums all data.  My personal experience says checksums are <em>good</em>.   Snapshots?  Sure snapshot to your heart's content.  We snapshot some systems hourly and never <em>ever delete</em> the old ones.  Snapshots are really cool, but what if you could rollback to a snapshot?  zfs rollback.  What if you wanted to make a read/write copy of the fileystem or an old snapshot? zfs clone.  You want to store a lot of raw data? zfs has built-in compression.  Oh, and it is open-source.</p>

<p>Simply put.  ZFS.  Respect.</p>


