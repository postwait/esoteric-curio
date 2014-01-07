title: Why JSON sucks.
date: 2010-10-10 13:19:17
---

<p>JSON sucks.  Don't get me wrong, I love the simplicity of it.  It's simple, it's easy, it's portable, it's ubiquitous at this point. None of that means it doesn't suck.  Outside of Javascript (hence the portability), JSON itself is limited to native types in the grammar:</p>

<ul>
  <li>null</li>
  <li>object (like a hash)</li>
  <li>array</li>
  <li>string</li>
  <li>integer (signed 32bit)</li>
  <li>number (double)</li>
  <li>boolean</li>
</ul>

<p>Really? It's 2010 and we're all flocking to a grammar where we can only accurately represent integers up to 2<sup>31</sup>-1. WTF?  Any new standard we adopted should certainly have had grammar specifications for: 1, 8, 16, 32, 64, 128 bit signed and unsigned integers, 32bit and 64bit IEEE floating point (float and double) as well as arbitrary precision real numbers.  I'd much rather have a grammar that I struggle to translate into my native language data types (like, "hmmm, what am I supposed to do with a real in C?") than I would have a grammar in which I cannot precisely express myself.</p>

<p>Every time I need to (correctly) represent a large integer such as 4611686018427387900, I'm forced to do so in a string.  It causes me to throw up in mouth a little. Everyone seems dead set on this, so I suppose I'll learn to cherish the flavor of bile.</p>
