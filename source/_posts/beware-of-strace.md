title: Beware of strace
date: 2005-10-11 13:16:47
---

So I have this app... And it *appears* to be misbehaving.  I can't tell quite what it is blocking on (or momemtarily pausing on) as the case may be just by staring at top or its log files.  It's supposed to perform around 300 message submissions per second and appears to be doing like 30.  So, where's the problem?  Or more importantly, how do we find the problem?

[DTrace](http://www.sun.com/bigadmin/content/dtrace/) is the right answer of course, but I'm on Linux and FreeBSD here.  Besides, just because a new spectacular tool comes out doesn't mean you have to forget how to use the tools that have carried you up 'til now.

    # lsof -n -p 14983 | awk /TCP/'{print $2" "$4" "$5" "$7" "$8;}'
    15548 4u IPv4 TCP 10.0.0.183:57525->10.0.0.90:mysql
    15548 5u IPv4 TCP 10.0.0.183:57527->10.0.0.90:mysql
    15548 7u IPv4 TCP 10.0.0.183:57524->10.0.0.90:mysql
    15548 8u IPv4 TCP 10.0.0.183:57526->10.0.0.90:mysql
    15548 9u IPv4 TCP 10.0.0.183:57548->10.0.0.206:1825
    15548 10u IPv4 TCP 10.0.0.183:57549->10.0.0.206:1825
    15548 11u IPv4 TCP 10.0.0.183:57550->10.0.0.206:1825
    15548 12u IPv4 TCP 10.0.0.183:57551->10.0.0.206:1825
    15548 13u IPv4 TCP 10.0.0.183:57552->10.0.0.206:1825

Now that I've got the file descriptors related to my network connections, let's trace this bad boy and see what it's doing.

    # strace -p 14983
    [pid 14983] <... futex resumed> )       = 0
    [pid 14984] <... writev resumed> )      = 11328
    [pid 14983] futex(0x9b25748, FUTEX_WAKE, 1 <unfinished ...>  ...  
    [pid 14984] read(13,  <unfinished ...> 
    [pid 14983] <... futex resumed> )       = 0 
    [pid 14983] time(NULL)                  = 1129036848 
    [pid 14983] write(6, "1129036848 log message"..., 46) = 46 
    [pid 14983] time(NULL)                  = 1129036848 
    [pid 14983] gettimeofday({1129036848, 660015}, NULL) = 0 
    [pid 14983] fcntl64(5, F_SETFL, O_RDWR|O_NONBLOCK) = 0 
    [pid 14983] read(5, 0x9af2918, 8192)    = -1 EAGAIN (Resource temporarily unavailable) 
    [pid 14983] fcntl64(5, F_SETFL, O_RDWR) = 0 
    [pid 14983] write(5, "F\\0\\0\\0\\3INSERT INTO run_3455_gen (u"..., 74 <unfinished ...> 
    [pid 14986] <... read resumed> "\\0\\24", 2) = 2 
    [pid 14983] <... write resumed> )       = 74 
    [pid 14986] read(11,  <unfinished ...> 
    [pid 14983] read(5,  <unfinished ...> 
    [pid 14986] <... read resumed> "6D/8F-27194-ACD3B434", 20) = 20 
    [pid 14986] writev(11, [{"\\0009", 2}, {"MSGHDR1"..., 57},
                            {"\\0!", 2}, {"MSGHDR2"..., 33}, {"\\0\\0+\\350", 4},
                            {"MSGDATA"..., 11240}], 6 <unfinished ...> 
    [pid 14983] <... read resumed> "\\7\\0\\0\\1", 4) = 4 
    [pid 14983] read(5,  <unfinished ...> 
    [pid 14986] <... writev resumed> )      = 11338 
    [pid 14983] <... read resumed> "\\0\\1\\0\\2\\0\\0\\0", 7) = 7 
    [pid 14986] read(11,  <unfinished ...> 
    [pid 14983] gettimeofday({1129036848, 661707}, NULL) = 0  <unfinished ...> </pre>

So, you lose a little bit above without timings (and yse you could get those with -ttt), but I see that the read()s on fd 11 are hanging...  Mission accomplished.  I hit CTRL-C to stop tracing...

    Process 14983 detached Process 14984 detached Process 14985 detached ...
 
hang...   hang...  **HELLO?!?!**, so I CTRL-Z to get my session back.

Well, a `ps auxww | grep 14983` shows my traced process STOPped.  That's not good, it was **supposed** to be doing 300 messages/second and I started doing this because 30 messages/second was too slow.  Now its doing 0 message/second.  Shit.  `kill -CONT 14983`... nothin'.  `ps auxww | grep strace` show my strace at 15031 not killed -- it is STOPped as expected.  `kill -CONT 15031`... nothin'.  `kill 15031`... nothin'.  Fine, be that way: `kill -9 15031`.  That worked.

Now let's see how if out process is back and running or if it is still in a STOP state needing a SIGCONT to go on with life.

    # ps auxww | grep 14983 root
    15053  0.0  0.0  4760  672 pts/2    R+   09:21   0:00 grep 14983

WTF?!  strace?  What the hell did you do to my process?  Did I accidentally run you with the `--decimate` option.  In opinion, no analysis tool should damage the process it is looking at.  While in this particular case I was able to clean up the mess, it wasn't easy.  Never-the-less, cleaning it up by hand wasn't on my todo list when I started looking at a slowness issue.  Sigh.

And, though I can get much much much more granular information to pinpoint my problem using dtrace, I would have to write a dtrace script to accomplish that.  And strace is just easier for a first round "What's up?" to a  process.  So, unlike my usuall rants about how great dtrace is, this is just a question as to why ktrace on FreeBSD and truss on Solaris work exactly as expected and why strace on Linux does not.
