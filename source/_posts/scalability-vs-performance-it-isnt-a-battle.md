title: Scalability vs. Performance: it isn't a battle
date: 2007-05-24 00:17:23
---

</p>So, <a href="http://l42.org/GQ">I do a lot on the scalability front</a>.  I spend a lot of time <a href="http://omniti.com/services/scalability">reviewing people's architectures and helping them understand how things can change to make sure that their data infrastructure can survive substantial growth</a>.  Scalability isn't a new concept, but before 10 years ago, there was so much concentration on performance that people that specialized in the area of scalability had to make a point.  What was that point?</p>

<p>Scalability has little to do with performance; moreover, a scalable solution is one that does not need to change when the problem size increases.  Vertical scaling (which is buying bigger machines to crunch the problem faster) is inherently limited by the hardware available on today's market; and while it is always getting faster, it is likely that your cool new idea will manage to exceed the capacity of one of these monsters.  Horizontal scaling (adding more machines, not faster ones) is what "scalability" is all about.  And clearly this has nothing to do with performance.</p>

<p>Point made.  However, somewhere along the way, a sense of relativity was lost.  The sentiment of horizontal scalability being so important that performance is irrelevant.  This is a scary outlook, but one I more and more commonly see.</p>

