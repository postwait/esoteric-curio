---
title: "Perfect[-enough], cheap[-enough] hashing"
date: 2004-02-05 02:47:00
type: post
categories:
- Damaged Bits
tags:
- programming
---

So, I was implementing this thing...  It seems that all my discussions start like this. Sigh.  <p>So, I was implementing this caching systems for file signatures.  I needed a hashing algorithm with excellent distribution and low calculation cost.  My first assumption was that MD5 didn't meet my needs due to its computational costs...  I was surprised.</p>  <p>I found a <a href="http://www.cs.duke.edu/~anderson/hashing/">great exploratory article on hashing</a> that assisted my search for the perfect[-enough], cheap[-enough] hash.</p>  <p>Ended up going with MD5 in the end anyway!</p>
