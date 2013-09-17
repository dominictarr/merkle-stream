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

A tree with 16 objects would look like this:

``` js
{
  "hash": "329f6212dae4bacde1309adccca698b11ff6e9b2",
  "tree": {
    "": {
      "hash": "67d49ee3e0571a9c80dafad5ac95ba3ea04b7340",
      "tree": {
        "0": "067d5096f219c64b53bb1c7d5e3754285b565a47",
        "1": {
          "hash": "7a41ac5bd7c166f942a3b787be0b41a561d87e8b",
          "tree": {
            "11": "11f4de6b8b45cf8051b1d17fa4cde9ad935cea41",
            "1e": "1e32e3c360501a0ede378bc45a24420dc2e53fba"
          }
        },
        "2": "2d0134ed3b9de132c720fe697b532b4c232ff9fe",
        "3": "320355ced694aa69924f6bb82e7b74f420303fd9",
        "5": {
          "hash": "a9ef02c047067ecd8207e3dad75076589fa5ad3c",
          "tree": {
            "5b": "5ba93c9db0cff93f52b521d7420e43f6eda2784f",
            "5d": "5d1be7e9dda1ee8896be5b7e34a85ee16452a7b4"
          }
        },
        "8": {
          "hash": "61716e4732c420260aaf16ec950866536062d0bf",
          "tree": {
            "8d": {
              "hash": "38950661855659c222ecbca76db3ccf1f7f0f747",
              "tree": {
                "8d8": "8d883f1577ca8c334b7c6d75ccb71209d71ced13",
                "8dc": "8dc00598417d4eb788a77ac6ccef3cb484905d8b"
              }
            }
          }
        },
        "9": "9842926af7ca0a8cca12604f945414f07b01e13d",
        "a": {
          "hash": "10d543033b21a29ee27fc296a02afe7c26e21ffb",
          "tree": {
            "a4": "a42c6cf1de3abfdea9b95f34687cbbe92b9a7383",
            "ac": "ac9231da4082430afe8f4d40127814c613648d8e",
            "ad": "adc83b19e793491b1c6ea0fd8b46cd9f32e592fc"
          }
        },
        "b": "bf8b4530d8d246dd74ac53a13471bba17941dff7",
        "c": {
          "hash": "006018cf72c4d2b58ba2543e3c73829f5cb6fe19",
          "tree": {
            "c4": "c4ea21bb365bbeeaf5f2c654883e56d11e43c44e",
            "c7": "c7255dc48b42d44f6c0676d6009051b7e1aa885b"
          }
        }
      }
    }
  }
}
```

## todo

* Exchange protocol for comparing two trees over a duplex stream.
* Insert a new object into the set (of hashes) and only update the hashes
  that are changed. (do not recompute the 

## License

MIT
