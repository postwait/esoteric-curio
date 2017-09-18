---
title: "Big Bad Postgres Indeed"
date: 2009-08-11 01:45:39
type: post
categories:
- Damaged Bits
tags:
- postgres
---

<p>I gave a talk at the Percona Performance conference (same time as MySQL, in the same facility... can we say awkward?) about running large PostgreSQL installs.  I referred to a few instances in the presentation that are a handful of terabytes in size.  In today's world, these aren't that large, however we do pretty deep analytics on these installs.  It is most definitely not a case of store and forget.</p>  <p>A few people came up and said: "I thought you were going to talk about big... a terabyte is not big."  I would rebut that with it's not how big it is, it is what you do with it, but then I would be on the defensive.  The truth of the matter is that it is a combination of things.  Size matters: below a certain threshold, you simple can't call it large.  Usage matters: if you don't do something interesting with the data, you might as well be throwing it away.  While most of the PostgreSQL instances we deal with were considered larger by 2005 standards, a terabyte simply no longer meets the bare minimum for "large."</p>  <p>I'm excited that we're looking to launch a new service that will turn the tables on large for PostgreSQL.  We very well could have 10 petabytes in postgres in no time if things go as planned.  Not only will we meet the size requirements, we'll also be doing lots of interesting things with the data.  Big Bad PostgreSQL indeed.</p>
