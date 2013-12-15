var Merkle = require('./')
var createStream = require('./stream')
var _hash = require('./util').hash

function isDefined (v) {
  return 'undefined' !== typeof v
}

/*
Example of how to use Merkle for replication.
*/

module.exports = function (hash) {
  var set = {}
  var tree = new Merkle()

  hash = hash || _hash

  return {
    set: set,
    tree: tree,
    add: function (obj) {
      var h = hash(obj)
      set[h] = obj
      tree.update(h)
      return this
    },
    createStream: function () {
      var s = createStream(tree).start()
      s.on('send_branch', function (tree, exclude) {

        tree.leaves().forEach(function (key) {
          if(key == exclude) return
          if(isDefined(set[key]))
            s.send(key, set[key])
          else
            console.error('do not have branch:'+ key)
        })
      })
      s.on('receive', function (key, obj) {
        var _key = hash(obj)
        if(_key !== key)
          s.emit('error',
            new Error('invalid object, expected:' + key + ' but got: ' + _key))
        else
          set[key] = obj
      })
      return s
    }
  }
}

