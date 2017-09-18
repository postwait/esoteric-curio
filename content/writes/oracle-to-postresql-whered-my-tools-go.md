---
title: "Oracle to PostreSQL: where'd my tools go?"
date: 2006-11-01 14:53:00
type: post
categories:
- Damaged Bits
tags:
- oracle
- postgres
---

<p> For those that are really familiar with running Oracle on production systems, you realize that it has issues (as do all databases) but there are certain things that you can ask of your database that after a while you start to take for granted.  Particularly, all of the statistics and introspection tools that you can use to see what is really going on in the system.  For a long time, I've used <a href="http://tora.sourceforge.net/">TOra</a> for that.  TOra is a good tool for general database use, analysis and troubleshooting.  It has an excellent query tool, database schema explorer and lots of other toos specifically for Oracle. </p> <p> When some of our systems switched to PostgreSQL, I was left in a lurch.  There are really no good tools for analysis, running long queries, doing explain plans.  What makes a tool "good"?  Simply put: "I like it and find it useful and stable."  I liked TOra. </p> <p> TOra uses QT from Trolltech to manage its UI and QT provides a simple database abstration layer.  While TOra natively connects to Oracle using the Oracle client libraries it <strong>can</strong> use the generic database layer.  The issue is that the system bases a lot of its assumptions on Oracle's internal data layout.  It assumes that OWNER and SCHEMA are one and the same.  In PostgreSQL you can have database objects in schema A owner by owner B.  Schemas are used for separating objects into namespaces, so it would only make sense that a database schema exploration tool would break things down by schema.  In Oracle this is accomplished by looking at the OWNER -- in PostgreSQL it is not. </p> <p> So, instead of being frustrated, I cracked the lid and <a href="http://omniti.com/~jesus/projects/tora-pg8.patch">changed the relevant queries in TOra 1.3.18</a> to handle PostgreSQL's concept of namespaces (schema).  This makes the tool infinitely more useful for me... and I hope others in the same situation. </p>
