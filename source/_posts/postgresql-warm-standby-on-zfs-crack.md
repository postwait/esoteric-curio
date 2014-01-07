title: PostgreSQL warm standby on ZFS crack
date: 2007-07-03 01:06:32
---

<p>So, the state of open source database replication is pretty sad.  <a href="http://www.mysql.com/">MySQL</a> replication just doesn't cut it in many serious environments because the slaves can't keep up with the write load on the master.  So, <a href="http://www.postgresql.org/">PostgreSQL</a> right?  Well, not so fast.  PostgreSQL replication is handled in one of two ways: <a href="http://slony.info/">Slony</a> or <a href="http://www.postgresql.org/docs/8.2/static/continuous-archiving.html">PITR</a> (point-in-time recovery).</p>

<p>Slony provides all the same features as MySQL's replication (except that it is much harder to setup and maintain), but also boasts the same acute performance issues -- a busy master can easily outpace slaves, leaving them in the dust.  Query-log-based replication is pretty flawed and while <a href="http://mysqldatabaseadministration.blogspot.com/2007/05/pre-fetch-binlogs-to-speed-up-mysql.html">creative people will do whack shit to try to push the envelope</a> this still doesn't make it a good method.</p>

<p>PITR is much more like <a href="http://www.oracle.com/">Oracle</a>'s replication mechanism.  PITR takes the WAL (write-ahead logs) and ships them over to the slave to be reapplied.  This leaves you with an identical database (block for block) and a weak machine can easily keep up with a beefy master.  In Oracle terminology "WALs" are called "archive logs."</p>

<p>So, with PITR, all our problems are solved, right?  No.  When using a PITR-style warm standby configuration the database is in "recovery mode" all the time.  This means the database is "sorta up" waiting for the next WAL log to appear so that it can play forward through the transactions and "catch up" to the master: "continuous recovery."  This means the database isn't available for queries.  Now, Oracle works the same way.  While Oracle is recovering, you can't use the database.  However, using Oracle you can cancel recover, mount the database read-only, do some queries, unmount and begin recovery again picking right up where you left off.  In PostgreSQL you cannot open the database in read-only mode and then later continue recovery as the act of opening the database (even in read-only mode) will deviate from the path of the recovery -- can we say design flaw?</p>

<p>While Oracle's "got game" on PostgreSQL, the concept of stopping recovery so that we can run queries on the slave isn't ideal.  If my queries are substantial my "warm standby" will get colder and colder as it sits neglecting to apply archive logs.  So, I want my warm standby and I want to be able to run long, heavy queries against it.  <a href="http://code.google.com/soc/2007/postgres/appinfo.html?csaid=6545828A8197EBC6">And someone's going to give it to me!</a></p>

<p>However, I'm impatient.  So, I'm going to make it work myself.  Using the power of ZFS, I'm going to snap my PITR slave and clone it into a "disposable" "point-in-time" copy.  This is really useful for running heavy reports.</p>

The basic concept is this:

<ul>
<li>I've got PostgreSQL running on my box as a PITR slave.  The master is pushing WAL logs over and this box is running in recovery mode.</li>
<li>Per best practices, my postgres data directory, xlogs and WAL archives are on different filesystems (ZFS of course).

<pre>
intmirror/postgres/82_xlogs  64.1M  66.8G  64.1M  /data/postgres/82_xlogs
store2/postgres/82    10.5G  1.97T  8.15G  /data/postgres/82
store2/postgres/82_walarchives 14.4G  1.97T  3.89G  /data/postgres/82_walarchives
</pre>
</li>
<li>zfs create store2/clonedb</li>
<li>I create zone called "clonedb" with a zonepath /zones/clonedb</li>
<li>I make 'store2/clonedb' subject to an 'add dataset' in the clonedb zone configuration.</li>
<li>I setup the zone to run postgres just as the globalzone does.</li>
</ul>

<p>Now, all I have to do is get a copy of the PITR stuff into that zone.  There are a few caveats: (1) due to postgres' design the copy must be read-write as it will be destructive even in read-only mode and (2) it will still be in recovery mode, so I'll need the last WAL archive so that it can "finish" recovery before I bring it online.</p>

<p>ZFS gives us cheap, fast read-write clones of filesystems:</p>
<pre>
<b>In the global zone:</b>
zfs snapshot store2/postgres/82@clonebase
zfs clone store2/postgres/82@clonebase store2/clonedb/82

<b>In the clonedb zone:</b>
zfs mount /store2/postgres/82
zfs set mountpoint=/data/postgres/82 store2/clonedb/82
</pre>

<p>I need to make sure I copy the latest WAL archive from the PITR slave into the pg_walarchives directory on my clonedb zone. Then I just startup my postgres instance in the zone and touch the /data/postgres/82/failover file (this file tells my recovery script to stop recovering and start up normally).  Viola.</p>

<p>It might sound complicated, but we just run ./<a href="https://labs.omniti.com/trac/pgsoltools/browser/trunk/pitr_clone/clonedb_startclone.sh">clonedb_startclone.sh</a> and in about one minute we have a fully operational read-write database and the PITR slave is merrily continuing recovery.</p>

<pre>
# ./clonedb_startclone.sh
[Mon Jul  2 20:37:14 EDT 2007] Stopping postgres in clonedb
[Mon Jul  2 20:37:20 EDT 2007] Dropping clone and base snapshot
[Mon Jul  2 20:37:38 EDT 2007] Snapshot store2/postgres/82
[Mon Jul  2 20:37:39 EDT 2007] Clone to store2/clonedb/82
[Mon Jul  2 20:37:41 EDT 2007] Mount store2/clonedb/82 at /data/postgres/82 in clonedb
[Mon Jul  2 20:37:43 EDT 2007] Copy last WAL [0000000100000016000000FA]
[Mon Jul  2 20:37:43 EDT 2007] Make it active [induce failover]
[Mon Jul  2 20:37:43 EDT 2007] Start postgres in clonedb
[Mon Jul  2 20:38:07 EDT 2007] System up
</pre>

<p>Now I can run long data mining queries and other complicated reports against my standby database.  No load is induced on the master database at all (so no concern about negative production service effects) and the standby recovery is continuing on unaffected, so from the failover point-of-view nothing has changed either.  I am not even limited to one zone!  Any time I'd like to, I can just "snap" myself a new query slave.  It's a <em>cheap</em>, mutable, entirely disposable copy. Nice.</p>

<p>It's worth noting that this same technique should work like a charm on Oracle as well.  Also, it should work well with any other filesystem that supports copy-on-write cloning -- though I don't know of any other than ZFS.</p>

<p>This, in a long line of things, just lets you know that when your database doesn't quite have the spunk to finish the race, today's operating systems are actually powerful enough to drag them across the finish line.</p>
