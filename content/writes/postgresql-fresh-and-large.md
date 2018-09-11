---
title: "PostgreSQL Fresh and Large"
date: 2005-11-24 02:34:03
type: post
categories:
- Damaged Bits
tags:
- databases
---

<p> We've recently engaged in a large <a href="https://www.oracle.com/">Oracle</a> to <a href="https://www.postgresql.org/">PostgreSQL</a> migration project here at the old <a href="https://www.omniticc.com/">dayjob</a>.  While this isn't extraordinary in its own right, it is a bit unique due to the size of the installation and the fact that while it is migrating away from Oracle, it isn't getting very far from Oracle.  So, how big is big?  We have thousands of tables, some small (a few hundred rows) and some a bit larger (not the largest table, but a big one I can afford to run a select count(*) on): </p> <pre> postgres=# select count(*) from ods.ods_tblhits;     count -----------  366333111 (1 row)  </pre>  
