title: What time is it?
date: 2009-06-16 19:28:40
---

<p><a href="http://postgresql.org/">PostgreSQL</a> has pretty <a href="http://www.postgresql.org/docs/8.3/static/functions-datetime.html">awesome date/time functionality</a>.  I've used a lot of database and the functionality and thoroughness of the treatment of dates and times (and particularly timezones) is unparalleled.  As much as I'm impressed with it, I knew there would come a time where the outcome of all that cleverness would backfire.</p>

<p>Recently, I was <a href="http://labs.omniti.com/trac/reconnoiter/ticket/140">doing some data partitioning</a>.  I split a couple of largish (approximately billion row) tables up into month segments.  I wrote a tiny little pl/pgsql function that takes a parent table, and creates an inherited child with the right indexes, triggers, check constraints (for constraint exclusion) and permissions.  I renamed the big table something transient, created a new parent table with the old table's name, made the old unwieldy table a child of that table and then created a whole bunch of new partitions.  This allowed me to pretty much ignore my shenanigans from the application side. Once I created the partitions, I need to back populate them.  To do this, I did the following:</p>

<pre>
ALTER TABLE newchildtable_200903 DISABLE TRIGGER ALL;
INSERT INTO newchildtable_200903
  SELECT * FROM oldcrappytable
  WHERE whence >= '2009-03-01 00:00:00-00'::timestamptz
      AND whence < '2009-03-01 00:00:00-00'::timstamptz + '1 month'::interval;
DELETE FROM oldcrappytable
  WHERE whence >= '2009-03-01 00:00:00-00'::timestamptz
      AND whence < '2009-03-01 00:00:00-00'::timstamptz + '1 month'::interval;
ALTER TABLE newchildtable_200903 ENABLE TRIGGER ALL;
</pre>

<p>Suffice it to say, this did not do what I wanted <em>at all</em>.</p>

<p>PostgreSQL's interval type is one of its more clever features.  The idea that a month isn't always equal to a month is a Gregorian truism.  So, PostgreSQL is design to "do the right thing" and consider a month in the context of another argument.  A month in the above example is a month with respect to March.  Right?  No.</p>

<p>The lacking part here is the timezone.  I do the partitioning in UTC (because I'm not insane).  So, I need the month of March in UTC.  Although I explicitly stated '2009-03-01 00:00:00-00' in UTC, PostgreSQL interprets that in the client's timezone... and <em>then</em> adds a month.  I'm in US/Eastern which is <em>trailing</em> UTC by four or five hours and thus the reference starting point is actually in February of 2009, which only had 28 days.  So, the latter inequality up there does not do through the end of March!</p>

<p>I would argue that this behavior is invalid, because of the extremely unexpected results of the following simple test case:</p>

<pre>
postgres=# select ('2009-03-01 00:00:00-00'::timestamptz + '1 month'::interval);
2009-03-28 19:00:00-04

postgres=# set timezone = 'utc';
SET

postgres=# select ('2009-03-01 00:00:00-00'::timestamptz + '1 month'::interval);
2009-04-01 00:00:00+00
</pre>

<p>Here I get a <em>completely</em> different date/time if I ask what appears to be a very unambiguous question depending on whether I'm left or right of the <a href="http://en.wikipedia.org/wiki/Prime_meridian">Prime Meridian</a>.
