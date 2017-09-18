---
title: "Simply unacceptable engineering"
date: 2007-01-13 02:09:44
type: post
---

<p>I spend a lot of time griping about things not working.  I have a lot to do, and I <b>expect</b> things to work.  So, I complain when they don't.  I don't think that's unreasonable.  Today, I feel compelled to discuss a single data point in the realm of bad engineering (a.k.a. how <em>in the @#$%</em> could anyone ever think this is acceptable).  Our story starts with SQL Server.</p>  <p>I'm trying to do some live replication between SQL Server and another database (non SQL Server) and I'd like to do this in a generic way.  So, I approach this from the DML-replay angle.  I'll create a trigger on the desired source table that logs inserts, updates and deletes into a DML replay table and then with the desired frequency, I'll pull the new records from the DML replay table and apply them on my local database (happens to be PostgreSQL).</p> 
