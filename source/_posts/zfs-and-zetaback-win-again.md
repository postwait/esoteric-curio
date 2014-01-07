title: ZFS and Zetaback win again
date: 2010-06-18 16:33:55
---

<blockquote>
<p>Now that it's all set up, I gotta say, I think zetaback is the best thing since sliced bread for backing up big file servers.</p>
<p>We have an OpenSolaris file server with about 3TB of data, mostly in home directories. Â The kind of work my users do means that a lot of this data is in millions of small files. Â A full backup via rsync took a week; even a mostly empty incremental would take several hours due to rsync having to walk the tree and stat all those files. Â zetaback did a full backup in about two and a half days (mostly limited by the CPU speed of my backup server, since I'm using gzip compression) and an incremental took less than half an hour.</p>
<p>
--<br/> 
David Brodbeck<br/>
System Administrator, Linguistics<br/>
University of Washington
</p>
</blockquote>

<p>While I think that most of the accolades here go to the awesomeness that is ZFS, it is very nice to see that Zetaback has so elegantly made this magic accessible.</p>

<p>Congratulations to everyone what has made <a href="http://labs.omniti.com/trac/zetaback">Zetaback</a> what it is.</a></p>
