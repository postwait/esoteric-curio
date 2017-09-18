---
title: "PostreSQL swelling"
date: 2005-12-28 21:02:00
type: post
categories:
- Damaged Bits
tags:
- databases
---

<p> I wrote before about a largish postgres isntance.  Things are starting to take shape and more people are onboard my little Postgres flagship here.  All are repeating my same bitching and moaning during my adoption (teaching me that these are indeed critical issues to solve in postrges): </p> <ul> <li>What do you mean I can't hint to the query planner?</li> <li>I can't grant a user access to a schema including future tables in that schema, you're joking right?</li> <li>I'm not dirty... why do Ihave to vacuum?  WTF do you mean it takes a week to vacuum my multi-terabyte database?  Can you say "bad idea?"</li> <li>Why can't I use "COMMIT;" in my pl/pgsql stored proc?  I _do_ want to commit in the middle.</li> </ul> <p> Despite the problems, people are learning the new dialect and embracing its shortcomings for its stronger points -- mainly cost at this point.  Also, the fact that almost all DDL (like create table and key creation and truncation) are all transactional and part of rollback. </p> <p> Anyway, I was talking about largish tables before and managed to select count(1) from one of the smaller ones -- which just isn't a good demonstration. </p>  <pre> postgres=# select count(1) from ods.ods_tblbannerview;    count -----------  597416021  postgres=# select count(1) from ods.ods_tblusersanswers;    count -----------  819682288  postgres=# select count(1) from pg_catalog.pg_tables;  count  -------   2195  </pre>  <p> Tons of tables, many dynamically replicated from Oracle -- how ya like them apples?  I do. </p>
