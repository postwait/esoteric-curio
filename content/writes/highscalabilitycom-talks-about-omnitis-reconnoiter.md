---
title: "highscalability.com talks about OmniTI's Reconnoiter"
date: 2009-08-16 19:13:07
type: post
categories:
- Damaged Bits
tags:
- monitoring
---

<p>It&#8217;s exciting to see things starting to take off.  The momentum and excitement around <a href="https://labs.omniti.com/trac/reconnoiter/">Reconnoiter</a> are at an all time high here at <a href="https://omniti.com/">OmniTI</a>.  I really appreciate Todd Herr&#8217;s <a href="https://highscalability.com/reconnoiter-large-scale-trending-and-fault-detection">extensive write up about Reconnoiter</a> over at <a href="https://highscalability.com/">highscalability.com</a> &#8212; the review was spot on.</p>  <p>It has ample criticism (all deserved) and we&#8217;re continuing to work on the &#8220;consumability&#8221; aspects of the product.  One of the comments he made was the interesting choice of <a href="https://lua.org/">Lua</a> as a language to extend the product.  I really wanted to use Perl or Python to extend Reconnoiter, but Lua has some pretty magical properties that made it meld well with the noit internals.  In my opinion it is perhaps one of the more technically interesting parts of the product as the search was long and the choice reluctant.  When I have more time, I&#8217;ll write an article about embedding lua in noit and the deeper reasoning behind it.</p>  <p>Also, don&#8217;t be scared by Lua, you can always write extensions in C!  Although it doesn&#8217;t meld well with its high performance design, there is an <code>extproc</code> module that allows writing checks as standalone scripts and operates fine with existing <a href="https://nagios.org/">Nagios</a> checks &#8212; I say I wrote it to make adoption a bit easier, but in truth <a href="https://omniti.com/is/eric-sproul">Eric</a> and <a href="https://omniti.com/is/mark-harrison">Mark</a> made me do it.</p>
