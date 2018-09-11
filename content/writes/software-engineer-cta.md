---
title: "Software Engineer CTA"
date: 2010-09-13 17:53:54
type: post
categories:
- Damaged Bits
tags:
- dtrace
---

<p>A while ago I started a <a href="https://labs.omniti.com/labs/project-dtrace">project</a> to add <a href="https://dtrace.org/">DTrace</a> probes into common open source applications we use at <a href="https://omniti.com/">OmniTI</a>.  I added them into <a href="https://httpd.apache.org/">Apache</a>/APR-utils (which were put back) and <a href="https://postgresql.org/">PostgreSQL</a> (which were also put back).  I've also added metrics exposure to the many applications we write internally (either in JSON or the <a href="https://labs.omniti.com/labs/resmon/">Resmon</a> XML DTD) over HTTP.  It's so easy these days to include an HTTP server into whatever daemon process you are writing/working on that there are almost no excuses to not wire one up and expose your application's internal metrics.  But why?  Because your junk will break and it pisses me off.  <a href="https://omniti.com/is/eric-sproul">Eric Sproul</a> and I recently refined a rant about why this is so important: <a href="https://omniti.com/seeds/instrumentation-and-observability">Instrumentation and Observability</a>.
