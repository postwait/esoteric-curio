---
title: "OpenSSH and SecurID, still a good choice."
date: 2008-09-02 15:01:47
type: post
categories:
- Damaged Bits
tags:
- security
---

<p>A long time ago, I wrote integration into the portable version of OpenSSH to allow direct authentication against an RSA ACE (SecurID) server. I've received many thanks over time for the work and I'm aware that it is used at some (very large) organizations. However, as with most security related things, people tend not to talk about what they do. As it is open source and no registration is required to download the patch, I think I might have underestimated the deployments.</p>  <p>Quite some time ago, Jim Matthews over at NASA took over maintenance of the patch. This sort of seamless transition of ownership is why I really love open source. Jim does a great job.</p>  <p>Since that patch's inception, it has been hosted on my <a href="https://lethargy.org/%7Ejesus/projects/">old static projects page</a>. That meant that James has to send me a copy to post every time a new version of the patch came out. How 1998. Anyway, since <a href="https://omniti.com/">we</a> went through all the effort of setting up <a href="https://labs.omniti.com/">open source hosting</a>, how about I use it!  The <a href="https://labs.omniti.com/trac/openssh-securid">OpenSSH+SecurID</a> integration effort has moved to labs!  Get your one-time-password, two-factor security while it's hot!</p>
