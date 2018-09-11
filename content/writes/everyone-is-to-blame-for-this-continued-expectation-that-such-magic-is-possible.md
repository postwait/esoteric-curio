---
title: "Everyone is to blame for this continued expectation that such magic is possible."
date: 2011-04-25 00:29:59
type: post
categories: 
- Damaged Bits
tags:
- zfs
- postgres
---

> My opinion is that the only reason the big enterprise storage vendors have gotten away with network block storage for the last decade is that they can afford to over-engineer the hell out of them and have the luxury of running enterprise workloads, which is a code phrase for “consolidated idle workloads.” When the going gets tough in enterprise storage systems, you do capacity planning and make sure your hot apps are on dedicated spindles, controllers, and network ports.
> 
> It was fantasy believing it was possible to pull off a centralized network block storage service in a multi-tenant cloud without any of the architecture shenanigans our enterprise brethren do and think that applications, databases, and business could depend on its being perfect. Honestly, we should have know better. We the applications developers asked what is perhaps the crappiest of all abstractions in computers to solve all of our availability problems for us. We asked for magic. Clearly, the vendor never should have made the promise of magic, but everyone is to blame for this continued expectation that such magic is possible.> 
> 
> - Mark Mayo of Joyent

This is from an [interesting article](https://joyeur.com/2011/04/24/magical-block-store-when-abstractions-fail-us/) by Mark Mayo over at [Joyent](https://joyent.com) with some excellent gems in it.
