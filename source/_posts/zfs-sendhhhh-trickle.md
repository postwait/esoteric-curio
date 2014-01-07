title: ZFS send^H^H^H^H trickle.
date: 2006-12-27 20:13:04
---

<p>One of the things that ZFS boast most is its scalability -- Z is for zetabyte after all.  Trivia question: what is the first thing you do after you put data on your production ZFS volume?  That's right, you back it up to your backup infrastructure.  A lot of systems use tar or other archive like derivatives to manage backups.  This technique is particularly awful with databases.  Databases usually consist of very very large files (multi-gigabyte) that have minimal changes to them.  With full archive systems, any attempt at incremental backups results in horrible space and time inefficiency as a small (8192 byte) change in a datafile will necessitate the whole file to be backed up in the next incremental.</p>

<p>Enter block-level incremental (BLI) backups.  The idea here is that you ask your filesystem to track which blocks change from a certain moment in time.  And you can ask the filesystem for all blocks of a filesystem (view consistent, of course) and then later ask it for the changeset.  In other words its like doing:</p>
<ul>
<li>snapshot FS as 'base', backup 'base'.</li>
<li>wait a day</li>
<li>snapshot FS as 'inc1', backup diff 'base' 'inc1'</li>
</ul>

<p>Filesystems have supported this type of behavior for a while now (Veritas VxFS has a magnificent implementation).  Needless to say I was ecstatic when I read the zfs manpage and learned of the 'zfs send' and 'zfs recv' operation.  Functionally, they implement BLIs.</p>

<p>We have a database on which we have around 1TB of information on zfs.  So, I figured we'd whip together a script to tie in zfs send (including incremental support) to our Veritas NetBackup infrastructure.</p>

<p>We have three mount points that we need to snap and send to NetBackup, so I create three FIFOs on disk and fork off three parallel 'zfs send' operations.  Then I fork off three parallel netbackup jobs (one for each FIFO).  We have three tape heads so, they all actually run in parallel and should fly like the wind (all over GigE).</p>

<pre>
# date; ./zbackup.sh -s -l 2006121402; date
Thu Dec 14 12:58:43 EST 2006
./zbackup.sh:
  backuplabel: 2006121402
  full

zfs destroy intmirror/xlogs@lastfull
zfs destroy xsr_slow_1/pgdata@lastfull
zfs destroy xsr_slow_2/pgdata@lastfull

Backing up as '2006121402'
starting postgres backup on label 2006121402
zfs snapshot intmirror/xlogs@lastfull
zfs snapshot xsr_slow_1/pgdata@lastfull
zfs snapshot xsr_slow_2/pgdata@lastfull
stopping postgres backup on label 2006121402
/sbin/zfs send intmirror/xlogs@lastfull >> /pgods/scratch/intmirror:xlogs.lastfull.full &
/sbin/zfs send xsr_slow_1/pgdata@lastfull >> /pgods/scratch/xsr_slow_1:pgdata.lastfull.full &
/sbin/zfs send xsr_slow_2/pgdata@lastfull >> /pgods/scratch/xsr_slow_2:pgdata.lastfull.full &

Sat Dec 23 15:39:47 EST 2006
</pre>

<p>SWEET JESUS!  That's a 9 day, 2 hour, 41 minutes and 4 second backup.  Somehow I think that doing daily incremental backups is out of the question.  I tried zfs send redirected to /dev/null (just to demonstrate that netbackup was not the bottleneck) and, as expected, there was no noticeable speedup.  I've tested this on some other machines and got the send operation to run quite fast.  However, any time a very competitive I/O load is added, it just suffers miserably and becomes so slow that it is useless.</p>

<p>Reading the source code to the ZFS layer leads me to believe that all the operations for doing the send are scheduled serially (each after the previous completes) and compete equally for system I/O with all other processes.  I saw no intuitive way to make the ioctl()s with ZFS act as if they were more important that other things going on in the system.  This leads me to believe that it may not be so easy to fix.  However, those Sun engineers have wicked tricks up their sleeves and tend to pull of some amazing feats.  So, here's hoping!</p>

<p>Until then, I hereby suggest that the 'zfs send' be renamed 'zfs trickle'.</p>

