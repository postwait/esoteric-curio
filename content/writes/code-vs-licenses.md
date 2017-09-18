---
title: "Code vs. Licenses"
date: 2013-09-28 15:40:58
type: post
categories:
- Damaged Bits
- Rambling
---
Let's start off with some basics:

 * I understand open source licensing very well.
 * I write a lot of code and have released code under myriad licenses.
 * I understand the value of licensing software.
 * I respect the authorship of code.
 * I *fucking hate* talking about licensing and arguing over violations.

Recently, I was harassed over GPLv2 licensing issues. It went entirely wrong, but it had a profoundly good impact on the project.  All is well that ends well, I suppose.  Scratch that, my time was wasted and I'm still quite irritable about the whole thing.
 
While I understand open source licensing quite well, I also understand that at the end of the day my opinion matters less than that of a judge.  A judge who likely knows very little about how computers or code work. Licensing issues are really just a 10th ring of hell.

## What happened.

A rights holder told me that I couldn't release my code under both the BSD and the GPL licenses as they are not compatible. My code, my rules.  Your code, your rules.  These are, after all, copyright issues.  If I have the sole copyright, I can put it under any license or licenses I wish.  The copyright holders of today's countless dual (or even tri) licensed software products would agree.  

While they insisted that what I was doing wasn't kosher.  I asked a simple question: "What clause or clauses of the GPLv2 am I violating and by what action?" With the answer to that question, I promised to fix the problem. Hours of back and forth, still no answer to that question.  This is why I call it harassment (wasting my time with empty claims); I'll note there was no hostility on either side... everyone was professional.  At some point I decided that the discussion itself was a tax I couldn't afford.

## Getting more concrete.

One of [Reconnoiter](http://github.com/circonus-labs/reconnoiter)'s programs (the IEP system that turns metrics into alerts) is written in Java and is resposible for analyzing data streams and alerting on undesired behavior.  The code for this was released under the GPLv2... and the three-clause BSD.  The code (at least some of it) leverages a pretty [fantastic event processing engine called Esper](http://esper.codehaus.org/).

Esper is released under the terms of the GPLv2.  So while one can certainly argue, I'm going to simply state that if I ship a program written in Java and I ship Esper with it and Esper's code is called in any way (including via subclassing), the code that powers that program must also be distributed under the terms of the GPLv2.  Great, it was.

Now, why would the code also be licensed under the terms of the modified BSD?  The answer is simple and all about open source and the Maker's mission.  Any open source code I use, I like to be able to use for purposes that may deviate from the licensor's original intentions.  

This system's code was also licensed such that I could take that code, and gut the Esper integration [(say for performance and scalability reasons)](http://www.circonus.com/blog/updates-from-the-tech-team/) and replace it with something else.  By gutting the Esper code, I no longer ship Esper or derive any parts of my program from Esper...  freeing me from the terms of the GPLv2 that accompanied it.  It should be obivous: by eliminating the software component from the stack, you eliminate any licensing terms that accompany it.

## What's next.

I'm here to build systems. I open source almost all the code I write.  People use that code to build entire businesses.  The GPLv2 simply sucks (don't get me started on the GPLv3 or AGPL).  I've wasted so much valuable time "discussing" whether various projects are compliant with the terms of GPLv2.  While we at Circonus freed ourselves from that issue long ago in our event processing system (by gutting Esper and using something custom), I just felt like the rest of the Reconnoiter user base are left in the same shitty position we were... no more.

I took two days out of my busy schedule last week to completely gut Esper from Reconnoiter.  All the code that leveraged Esper has been (trivially) rewritten to leverage Riemann.  All the new code is furthermore available under the three-clause BSD.  Reimann has a vibrant community that are trying to solve the same problems as the Reconnoiter community; it's a damn good fit.  I hope to have a future blog post to expound upon all the awesome that this effort brought to both communities.  Hat tip to Kyle Kingsbury for all the pointers!

Right now, I think I just need to go to the pub.

P.S. anyone know where I can get GPL urinal cakes?
