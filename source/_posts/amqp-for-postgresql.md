title: AMQP for PostgreSQL
date: 2009-12-19 23:00:27
---

<p>So, it turns out that being stranded in an airport can lead to some productive output after all.</p>

<p>I've hacked together an AMQP extension for PostgreSQL.  If you don't know what AMQP or PostgreSQL are, stop reading.</p>

<p>One thing I've needed to do for a while is be able to submit a message to a message queue from within a PostgreSQL transaction.  However, obviously (because we run a real database here), if the transaction aborts I'd rather not have those messages sent.  Enter pg_amqp.</p>

<p>pg_amqp allows:</p>
<ul>
 <li>Multiple connections to different AMQP brokers (configured in the amqp.broker table).</li>
 <li>Allows for the declaration of an exchange.</li>
 <li>Tries to be smart about bring up a connection to a broker on demand and leaving it connected to accelerate the next publication request.</li>
 <li>Allows AMQP publishing from within SQL that is transactionally aware (only publishes on commit).</li>
 <li>Allows AMQP publishing from within SQL that is autonomous (happens outside the current transaction).</li>
</ul>

<p>This is completely alpha.  I've tested it quite a bit by hand, but put no load on it whatsoever.  Monday of next week, I'm going to beat the ever-living @#$% out of it on one of our systems that desperately needs on-commit AMQP notifications.</p>

<p>I'd love some more eyes on this.  It has some flaws, specifically related to processing asynch events from within a PosgreSQL backend (which has no concept of asynchronous even notification).  As such, if you do stupid stuff, stupid things happen.  The easiest solution is to add a thread to each postgres backend to process the backqueue of events from AMQP; however that so blatantly violates postgres' process model and design that I've no intention to do that.  With all the issues aside &#8212; it works pretty well for me.</p>

<p>I didn't add queue declaration or the ability to consume from queues.  That was intentional because PostgreSQL can't run SQL outside of a transaction block making a while(1) { consume, do, commit } impossible from within SQL itself.  Without the ability to do that it seems really useless (and pretty dangerous) to allow someone to do a blocking AMQP frame receive from within SQL.  If you think it would be useful for you, let me know &#8212; it would be a trivial addition.</p>

<p>Oh yeah: <a href="https://labs.omniti.com/pgsoltools/trunk/contrib/pg_amqp">pg_amqp</a></p>

