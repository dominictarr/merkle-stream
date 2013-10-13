var Merkle = require('./')
var createStream = require('./stream')
var hash = require('./util').hash

function isDefined (v) {
  return 'undefined' !== typeof v
}

/*
Example of how to use Merkle for comparison (without replicating).
*/

module.exports = function (_hash) {
  var set = {}
  var tree = new Merkle()
  var compare

  hash = _hash || hash
  var missing = []
  return compare = {
    set     : set,
    tree    : tree,
    missing : missing,
    add: function (obj) {
      var h = hash(obj)
      set[h] = obj
      tree.update(h)
      return this
    },
    createStream: function () {
      var s = createStream(tree).start()
      //so, how do I detect that a comparison is complete?
      s.on('send_branch', function (pre, h, exclude) {
        if(exclude)
          console.log('EXCLUDE', exclude)
        var t = tree.subtree(pre).leaves().forEach(function (h) {
          if(h !== exclude) {
            console.log('MISSING', h, exclude)
            compare.missing.push(h)
          }
        })
      })
      return s
    }
  }
}

