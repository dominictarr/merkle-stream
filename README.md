# pull-merkle

Construct an optimally shallow merkle tree (in memory)

keys are ordered by their hash, so that it's possible to insert new keys,
with out recomputing the entire tree,

[![travis](https://travis-ci.org/dominictarr/pull-merkle.png?branch=master)
](https://travis-ci.org/dominictarr/pull-merkle)

[![testling](http://ci.testling.com/dominictarr/pull-merkle.png)
](http://ci.testling.com/dominictarr/pull-merkle)

## example

``` js
var shasum = require('shasum')
var merkle = require('merkle')

function toTree (objects) {
  var sorted = objects.map(shasum).sort()
  return merkle(sorted)
}
```

## todo

* Exchange protocol for comparing two trees over a duplex stream.
* Insert a new object into the set (of hashes) and only update the hashes
  that are changed. (do not recompute the 

## License

MIT
