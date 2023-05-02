---
title: "A Guide to Nomenclature Selection"
date: 2020-06-03T14:51:37-04:00
type: post
categories:
- Damaged Bits
---

## This is a guide for choosing terminology for software and software products.

I've been in the field for a while and things have changed. It stands to reason that things
will continue to change. Just as language changes over time, so should the nomenclature we
use to describe the software and services we build in tech. This serves as a living guide
as to how one might go about selecting choice words for things.

> #### My Thoughts:
> As a personal note, this document serves to remind me of how and why I should be careful
> with words: specifically the naming of things.

## Why are you here?

Likely someone sent you here because they claim you're using vernacular that is outdated, or
inappropriate, or could simply be improved upon. There's a good chance that someone told you
stop using the words "master" and "slave" to describe architectural components in systems.

## What's the goal?

From an ethical standpoint, the things we build as engineers and product owners should not
negatively impact human beings as they excercise their universal human rights.
Additionally, we all want our software to be useful to as many people as possible.
The words we use to describe software, its pieces, and within its
documentation can affect how it is received and adopted. Choosing the best words can
help improve adoption of and build a more inclusive and resilient ecosystem around that software.

## Why do I need to adopt this?

"Why? My words mean the right thing. I don't have to adopt this." Bottom line
is, you don't.  This, like all things, is a choice you make. Choosing
inclusive words takes almost no effort (that's why this document exists). So,
not only will you be judged for using poor words, you stand to be judged for
using them when it would have taken no additional effort to use better words.
Are you are jerk for insisting on using objectionable words? Well, that's
subjective and my opinion is: yes.

## It's a waste of time because the goal posts keep moving

Improving communication and inclusiveness is never a waste of time. Yes, new things come
to light and terms we once used become unacceptable. I suggest taking two simultaneous
approaches:

1. Put in a basic effort to be inclusive.
2. When it is brought to your attention that some term is a poor choice,
  1. fix it, and then
  2. understand why

## It's too much work to change everything

Maybe so. This isn't a simple yes/no answer. Certain terms are not a good choice and should be
avoided, but might not be worth retroactively changing. Other terms are undeniably offensive
and should be changed at all costs. A simple example: The N-word was "acceptable" in print two
hundred years ago and as it became less acceptable people stopped using it. At first, they
didn't change go back and change old messages... then they did.
I guarantee that if you found an equally offensive word in your product docs today, there is
literally no cost too large to go fix that. Time will change the severity of infractions and
what was once "not worth changing" will become "very worth changing." Time, it is relentless.

> #### My thoughts
> This was, in fact, the impetus of writing this document. There are terms that I will avoid
> using. There are terms that I will encourage others to avoid using. There are terms that
> I will avoid consuming (in that I will refuse to use a piece of software). All of this
> depends upon how damaging that term is. I also realize that the category into which a term
> falls today may change tomorrow... My response will be to fix it, then understand why, then
> write it down here.

# Reception

In the end, your aim should be to select nomenclature that is both accurate an well received
by your audience. Perception by your audience is a critical consideration. Words are used
to convey meaning and influence people, if you use words that are offensive or have common
alternative meanings that are negative, you simply will not have the best chance of influencing
the people you are talking to.

## Basics

### Gendering

If you use gendered words, it presumes you're talking to a specific gender. It will alieniate
many of a different gender and even those of the specified gender due to its insensitivity.
They, them, and their should be considered both signular and plural gender-nuetral alternatives
to their gendered counterparts. If sentence construction poses a challenge, it is acceptable
to drop into the passive voice to assist.

### Colloquialisms

Our society has a long history of racism, disenfranchisement, sexism, ableism, and general
otherism. In general, avoiding colloquialisms has the benefit of not accidentally carrying
forward the insensitive context of a phrase you did not fully undestand.

# Common Terms

## Master and Master-Slave

A common term used in database systems that replicate is "master/slave". The database that is
currently canonical is considered the "master" and copies are "slaves." It should not be
difficult to understand why this might not be sensitive to the lived experience or memory of
slavery (a clear violation of human rights). Master has other meanings (to master a skill)
or an authoritative copy (a master copy in recording). There are still issues with the word
master (without the context of slavery) that are problematic and we'll get to those in a
minute.

Many have decided to edit their documentation to replace master/slave with master/backup or
master/replica. And while this removes the context of slavery in that one document, the
challenge remains that in this area of computing (distributed systems, databases, networking)
the context predates your infraction.

> #### My thoughts
> If when you say "master", you or potential customers might *ever* think to complete
> that term with "slave," then your choice remains poor. I argue that in the world of
> networks, distributed systems, and databases any use of "master" is poor for this very
> reason.

### Alternative Terms

 * Active/Primary/Leader
 * Standby/Replica/Copy/Follower
 * Failover

### Master outside of a slave context

Another complexity of "master" is that it is a loosely gendered word in English. Almost
always there is another more suitable word. Let's look at `git` as an example.

`$ git checkout master`

I cannot find any instance anwhere of a `slave` counterpart in `git`. If someone told me
to checkout the `master` branch and I then asked "What about the `slave` branch?" they would
be thoroughly confused. There is no risk of anyone completing the concept of `master` in `git`
with the word `slave`. The word here has the meaning of the "authoritative copy" as a
"master recording" does in music.

That said, `git` has a concept of `branches` and `trunk` seems like an equally descriptive
replacement term and is far more appropriate metaphorically.

> #### My thoughts
> All documentation online for `git` uses `master` as the main branch of development and
> by adopting `trunk` you stand to create a barrier to entry for new developers that must
> know to not follow standard docs and practices to work on your project. If you want to
> change your `master` to `trunk` go for it, but I think asking every project to change
> will be a very hard sell.
>
> Time passes still, so I suspect in a decade that `git` might start defaulting new repos
> to use `trunk` and the transition will take root after which people will have to go
> out of their way to call it the `master` branch... and you'll be a jerk for doing so.

## Blacklists and Whitelists

The cultural significant of blacklists is based in racial descrimination. There are no
reasons to use these over their alternatives:

### Alternative Terms

 * Allow/Deny (lists)
 * Accept/Reject (lists)
 * Pass/Block (lists)

These alternative forms have significant clarity advantages in implementation because
they (without "lists") are verbs: Allow lists allow things, deny lists deny things.
Blacklists do not black things. If you argue that the verb *is* "blacklist," you have
illustrated the problem.

> #### My Thoughts
> I prefer accept/reject if for no other reason than they are both six letters and
> make code line up well.

# Conclusion

If there is one certainty, is that change happens.

Being angry that "your words have being taken from you" or that the goalposts have moved
is counter-productive. The point of words is to influence poeple and by choosing the best
words you stand to influence the most people. Choose the best words you can and when
you learn new things, adopt them.

I am always looking to learn and improve. If you have suggestions for additions or changes
to this document, please find me on Twitter or [issue a PR](https://github.com/postwait/esoteric-curio).


