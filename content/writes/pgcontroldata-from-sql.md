---
title: "pg_controldata from SQL"
date: 2010-04-29 13:45:48
type: post
categories:
- Damaged Bits
tags:
- databases
---

<p>Like many database, PostgreSQL stores critical (minimal) state about the database in what is called a "control file."  This control file has valuable information in it that speaks to backups, checkpoints, block sizes, etc.  PostgreSQL ships a tool called pg_controldata to dump this file's values in human-readable form.  I've been frustrated in the past that you can't see all these values from within a PostgreSQL SQL session.  At some point in the past I got in an argument about the usefulness of such a feature and I pretty well lost that argument: a postgres control file on an active database doesn't really show you (much) useful information and you really need it when the database is off (which is what pg_controldata provides).</p>  <p>PostgreSQL 9.0 changes the game.  You can run queries on a database that isn't active (particularly a standby database that is applying WAL files).  Now this feature becomes much more interesting.  I can use monitoring tools with SQL-only access to find out extremely useful things about the state of the standby.</p>  <p>I have to say, of all the postgres extensions I've written, <a href="http://labs.omniti.com/trac/pgtreats/browser/trunk/contrib/control">controldata</a> had to be the simplest.  Hopefully it is useful to someone other than just <a href="http://omniti.com/">us</a>.</p>
