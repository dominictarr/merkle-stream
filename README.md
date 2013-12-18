# merkle-stream

Construct a merkle tree and compare with remote tree via duplex stream.

And compare it with remote tree via duplex streams.
This module is a building block for creating secure replication protocols.

[![travis](https://travis-ci.org/dominictarr/pull-merkle.png?branch=master)
](https://travis-ci.org/dominictarr/pull-merkle)

[![testling](http://ci.testling.com/dominictarr/pull-merkle.png)
](http://ci.testling.com/dominictarr/pull-merkle)

## next steps

measure performance of replication, under different factors.
take a large dataset, with varying differences (between replicators)
compare sets that are mostly the same, mostly different, and half different.
graph performance (time, bandwidth) as the proportion changes.

Then, implement other strategies.
I suspect that a merkle tree is ideal when you have a large amount of overlap,
but you don't know where it is.

For example, compare with just sending the entire list of hashes,
this will be much simpler, and I think this may work better when the intersection is small.
It may also mean less round-trips. If one side only has a handful of items,
then it might be faster to just send everything they have.

okay, so the first phase... is to implement a benchmark on the handshake.
## License

MIT
