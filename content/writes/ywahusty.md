---
title: "#ywahusty"
date: 2011-02-04 15:41:44
type: post
categories:
- Damaged Bits
- Advice
tags:
- programming
---

### Defining the term:

I recently used a term and was hit with a lot of out-of-band requests for explanation. It's a good one and excellent food for thought.

_**ywahusty (yuh-wuh-hus-tee)**: you will always have users smarter than you._

This basic concept is one of sound, pragmatic systems engineering that might appear to fly in the face of traditional product engineering... but doesn't.

In traditional product engineering, there is a goal to produce a product that is both accessible and useful to the largest subset of the predefined audience of the product.  Basically, in software terms: you don't put too many knobs on the dashboard or you will have all sorts of operator errors.  You work very hard to tune those knobs or have then auto-tune so that the product behaves correctly under normal operational uses (and of course, their edge conditions).  This is just good product design.

We are faced with a problem: shit goes wrong.  As an engineer for a software product, you know full well that shit will break.  Those knobs will be set and/or auto-tuned and you'll be thinking: "what if?"  The: "Wow, I've never seen this set of inputs. The min_wu_tang_threshold is 11... it might behave better at 42 right now... sure wish I could twist that knob that product management insisted I leave off right now."  The truth is: the product you ship is not the product they receive.  Not every knob you ship has to be in the "manual," it can be in the unsupported "ninja manual."  You can absolutely instrument your application without sacrificing simple and intuitive use by the majority of your audience.

Bottom line? The knob should be there. My hat goes off to an [engineering team](http://www.messagesystems.com/company/who_we_are/) that takes this to heart: "I am ten ninjas." And a second tip of the hat to the diaspora of Solaris kernel engineers that have allowed us to tweak (seemingly) insane operational constraints on production systems without applying patches or rebooting.

### Appealing to the pragmatist.

I'll attempt to appeal to the pragmatist in you. You are equipped with more knowledge now than you were when you started reading this prose. This is a truth whether you agree with anything I've said simply because you have more information.  Even you, with you current implementation knowledge would benefit from the ability to tweak, twist and manipulate the parameters of your operating product because it will allow you to test new ideas, verify assumptions and validate the design and implementation choices you've made with far greater ease.

As a side note, gdb and/or mdb aren't the "knobs" I'm talking about: think more along the lines of sysctl's on most UNIX implementations.  These are (mostly) run-time tunable parameters -- and yes users _can_ set them to values that will cause certain, and often immediate, combustion.  (good) Kernel engineers know that price benefit of having these knobs far outweighs their liability.

### Appealing to the experienced.

Now, we come full circle, for the honest engineers that can check their ego at the door. I have never in my life developed a piece of successful software that had a user-base that contained only users dumber than myself.  The concept therein is absurd for any project with even moderate adoption.  You engineer your systems to be both observable and _operable_ because at the end of the day you will get schooled by (at least some of) your users.

Again... _please_ make your software operable. Why? #ywahusty
