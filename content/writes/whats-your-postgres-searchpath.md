---
title: "What's your postgres search_path?"
date: 2010-10-09 19:44:32
type: post
categories:
- Damaged Bits
tags:
- databases
---

<p>Hey you! PostgreSQL process running a query over there... Yeah you.  What's your search path?</p>  <p>Hello? Why aren't you listening to me?  Oh, just because you are busy running queries for someone else for hours means you don't have to take some time to answer my question?  Apparently, that's a good enough excuse. You, yes you process ID 18883, need to respect my authority.</p>  <pre> # echo '*postgres`namespace_search_path /s' | mdb -p 18883 0x9d5420:       noit_a29_n625680_noit, stratcon, public </pre>  <p>I done told you.</p>  <p>Sorry. I didn't mean to get rough with you. You know I love you, right?</p>
