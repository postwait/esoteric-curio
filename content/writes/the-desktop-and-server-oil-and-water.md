---
title: "The desktop and server: oil and water."
date: 2012-03-24 01:48:20
type: post
categories:
- Damaged Bits
tags: 
- illumos
- omnios
---

I've been using these computer things for a while.  I've written what is now over 100k lines of production C code and many thousands of lines of code in a variety of other languages.  I've seen my software run and I've run other people software.  One thing they all have in common is their propensity to break under unforeseen circumstances.  Shit happens.

On my laptop, I don't care much.  I want nice, I want convenient, I want new and pretty and productive.  I'm willing to tolerate a nominal amount of instability for those desires.  I have to reboot my Macbook Air at least once every month to accommodate general software failures and security updates. There is, after all, a lot of crazy software on my workstation. (yes I call my laptop a work station as it is the station at which I work -- how many of your do the same?)

Somehow, somewhere some engineer and their cult following decided that they wanted to make a datacenter operating systems be more desktop friendly and a product manager somewhere and their hefty company decided they wanted to make a desktop operating system be more datacenter friendly.  I would care so much about those decisions if they didn't constantly screw me.  This stops now.

I don't want sound drivers and X11 or gnome in my datacenter operating system.  I don't want the kernel developers considering how priorities and implementation decisions effect software that has no place near my database server or web server or load balancer.  I don't want my scheduler to be optimized for browsing the web while watching a video.  My server is to **serve** the Internet.

We've been working on something to scratch our itch at [OmniTI.](https://omniti.com/) If you are pissed off like me, maybe you'll like it... coming soon.
