---
title: "Weather Yonder"
date: 2017-12-04 14:02:15
coverImage: https://photos.smugmug.com/Schloss-Hollow/n-92KWPV/i-C3T9JZk/0/5c4d665c/XL/i-C3T9JZk-XL.jpg
coverSize: partial
thumbnailImage: /~jesus/images/partly_sunny.jpg
thumbnailImagePosition: left
autoThumbnailImage: yes
type: post
categories:
- Schloss Hollow
tags:
- circonus
---

A while back, Lisa and I bought plot of land in West Virginia called "Schloss Hollow."
Our goals were both epic and vague. We wanted a place all our own that our children would enjoy and
come back to later in life with their kids. This place is wonderful and I remain
amazed at how effectively and efficiently it recharges my soul.

The mobile reception out here is weak, slow and spotty.  While that is
fantastic while we are visiting (as the point of all this is to get away from
the grind of daily connected life), it poses some problems when we are not here.
Even looking a pictures of this place lightens my heart.

 * [a NEMA box](http://amzn.to/2Ao15M2)
 * an old Buffalotech wireless router
 * a [Netgear 4G LTE modem](http://amzn.to/2ihaniw)
 * [WilsonPro Signal 4G Direct Connect In-Line Booster Amplifier AC Kit](http://amzn.to/2jMD0Vd)OA

I drilled three holes for the antenna mounts from router and mounted the Wifi router,
then connected Netgear modem... all inside the NEMA box.  Ran the antenna line from the
WilsonPro into it and left the amplified unit outside the box, but still sheltered during
installation.  Then the 2m line from the amplified to the magnetic mount antenna was run
outside onto a mount.  I will say that the antenna did not stay internally afixed and I
thought this whole endeavor was for nothing, but we eventually sorted that... so embarrassing.

The signal sucks, but it works well enought to bring a bit of Schloss Hollow to us
while we are absent: the weather.

We bought the excellent [Ambient Weather 10-1 personal weather station](http://amzn.to/2iNBntN)
and connected it up to [weather underground](http://wunderground.com/) and while this
is cool I found myself asking questions that the tooling there just could not answer.
Enter [Circonus](https://www.circonus.com/).

I wrote up a little connector that pulls data from wunderground and pushes it into a
Circonus trap called [wunder-circonus](https://github.com/postwait/wunder-circonus) and
now I have all my data to be regressed.

Specifically, how much solar energy should I expect to generate?

Given the solar radiation measures, how many kW hours can I expect to produce over a day
at 1 square meter of paneling? This is a rolling 24-hour average optimal production.
Once we have a full solar installation and observable power there, I can figure out precise loss and
do capacity planning for seasons.  The tools in Circonus are pretty powerful for this.

<img width="100%" src="https://share.circonus.com/snapshot/graphs/813f4d9c-0969-4cc3-a78d-d078593c0ea6/BlgcyQ"/>

It is pretty funny when you get power, internet and weather monitoring before you get running
water and toilets.  I do not regret prioritizing the things that connect us to the nature of this place.

> For those playing along at home... I am pulling the solarradiation in as a metric (which is the moment reading of watts/m^2 from the weather station.  This data is not always available every minute due to submission intervals and Internet connectivity issues, so I need to fill in the gaps, take a rolling average and multiply by 24 to understand how many kilowatt hours I could produce over a day.

```
metric:average("494d50ce-0c18-4cff-808b-d64d8237446e","solarpower") |
	fill:forward() |
	rolling:mean(24h) |
	op:prod(24)
```
