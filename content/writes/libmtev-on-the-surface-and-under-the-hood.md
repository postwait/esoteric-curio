---
title: "libmtev: on the surface and under the hood."
date: 2017-02-14 08:28:56
type: post
categories:
- Damaged Bits
tags:
- programming
---

I haven't talked much publicly about [libmtev](https://github.com/circonus-labs/libmtev), but I think it might be about time to start.  The C programming language isn't going to die anytime soon and it has some distinct performance over some of the more populate emerging languages: the compilers are the most mature and there is no garbage collection{% sidebar-link gc %} (so no GC pauses).  Alas, this isn't about C as a language, but about the library that I started (within [another project](https://github.com/circonus-labs/reconnoiter)) in 2007.  It has become its own beast and now is the underpinning of many of the technologies we build at [Circonus](https://www.circonus.com/) such as [IRONdb](https://www.circonus.com/irondb/).

{% sidebar gc %}
### GC

The application of sophisticated techniques determining when memory is no longer used.  All techniques take time to run and can leave memory in limbo for periods of time.
{% endsidebar %}

## What is libmtev?

By the end of this, you might ask what is it not?  And while the classic UNIX approach is to develop many small single-purpose tools that can connect together, that tends to be a poor design decision for high-performance, low-latency application design. So, what is libmtev?

> libmtev is an open source framework for building high performance, mission-critical network services in C.

If you're already familiar with the space, you might think: libevent{% sidebar-link otherlibs %} is designed to do this.  libmtev contains a level of sophistication not found in other libraries.  It is far more than just a non-blocking event loop; it is a full featured standard library.

{% sidebar otherlibs %}
### Other libs

[libuv](https://libuv.org/), [libevent](https://libevent.org/), and [libev](https://software.schmorp.de/pkg/libev.html) all implement [event loops](https://en.wikipedia.org/wiki/Event_loop).
{% endsidebar %}

## Facilities

libmtev provides robust facilities above and beyond a non-blocking and asynchronous event execution environment. It provides everything you would typically need to build a complete service.

### Eventer

Typical event loop systems run a single loop and allow the programmer to register actions to fire on different types of "activity."  The libmtev eventer does that, but with considerably more sophistication.  Instead of a single thread running an event loop, the system can exploit multiple cores by running pools of threads, each with their own loop; this pool of threads is an `eventer_pool_t`.  In addition to the standard pool of event loop threads, one can establish alternative pools (with different concurrency and supervisor parameters). It also handles "asynchronous" events by scheduling them into thread pools (called `eventer_jobq_t`).

Every event callback in the system has a full latency profile tracked in histograms via libcircmetrics.

#### Native TLS Support

The eventer virtualizes the read/write/accept/close operations on file descriptor based events.  This provides a simple way of switching a session from plain text to TLS.  Complete control over the negotiation of the secure session is possible programmatically and via configutation.

### Configuration

The configuration systems of libmtev is one of its most powerful features. The configurations are XML-based, but with no DTD or other specification.  This allows the programmer to leverage arbitrary structure to describe the configuration they desire (and is appropriate for their specific application).  The configuration can be modified in memory while running and written back to the original config files: living configuration.

Two extensions are built into the configuration framework allowing for included XML files (without using XML's cumbersome include mechanisms) and "shattered" backingstores which can break large XML documents out into small filesystem parts and restrict write-back to only those bits and pieces which have been modified.  This allows complex and rich configuration to be shipped with a product and effecient management of large running configurations with surgical update sets.

### Supervisor (Watchdog)

libmtev has a built-in surpervisor framework that can provide automatic restarts on crash as well as tracing of managed processes.  Internally this system is called the "watchdog."  A watchdog can set per event loop in any (and all) `eventer_pool_t` in the system such that if something gets "stuck" the process will be terminated and restarted; think deadman timer.  Additionally, the watchdog can look for unexpectedly terminated processes (crashes) and perform tracing and restarts.

### Logging

The logging framework within libmtev has several implementations and is extensible via module.  In memory ring-buffers, simple files and journal logs (libjlog) are built in.  Files support rotation based on time and/or size leaving the "current desination" file having the same name.  All logging is lock-free.  An arbitrary number of log facilities can be created in the system and are connected into a directed acyclic graph.  Facilities can be disable or enabled via configuration or programmatically.  The logging integrates with DTrace where available.

### Network Listeners

Abrbitrary network listeners can be configured in the system and connecting new protocol handlers to the system is simple.  REST and telnet services are baked in.

#### HTTP/REST Server (and WebSockets)

There is a routing and dispatch layer (as well as ACL system) for HTTP endpoints that allow for simple registration of "HTTP handlers" at URI endpoints described by regular expression.  There is built-in JSON support for easily constructing valid documents in reply.

#### Telnet Console

There is an extensible telnet console that can allow an application to serve an interactive debug/command/configuration console.  Eventer (and other core facility) introspection is available here and the interaction framework can be extended to expose application specific operational controls.

### Clustering Primitives

Some basic concepts of clustering are available and built-in.  These are simply CHT (consistent hashing) services and liveliness awareness of cluster members.

### Abitrary Hooks

The `mtev_hook.h` hooking framework makes light work of providing aribtrary call-in and call-out points anywhere in code.  If you "might" want to control the behavior or flow control of a system later, you can add a hook point today and then attach to it from a dynamically loaded module at run time.

### Modules

libmtev ships with a full dynamically shared object (DSO) loading framework.  The system can be extended by writing modules that interact with hooks in the core framework.  The embedded luajit system is implemented as a loadable module.

### Embedded Lua

The embedded luajit interpreter `lua_general` allows arbitrary code to be written in lua.  Additionally a `lua_web` module is provided to make writing REST endpoints in lua simple.

### DTrace Instrumentation

DTrace is a first class citizen in libmtev.  Probes are provided for various aspects of the eventer and the logging system making observing the nuances of production behaior not only possible, but pleasant.

## Getting Started

[Read the documentation.](https://circonus-labs.github.io/libmtev/)

libmtev ships with a command line application called `luamtev` which effectively runs lua scripts within the libmtev runtime and event loop.  Also, the [`src/examples`](https://github.com/circonus-labs/libmtev/tree/master/src/examples) directory has a fully functional app with telnet command and control.
