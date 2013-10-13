var Merkle = require('./')
var createStream = require('./stream')
var hash = require('./util').hash

function isDefined (v) {
  return 'undefined' !== typeof v
}

/*
Example of how to use Merkle for replication.
*/

module.exports = function (_hash) {
  var set = {}
  var tree = new Merkle()

  hash = _hash || hash

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
//          console.error('>>>', pre, key)
          if(isDefined(set[key]))
            s.send(key, set[key])
          else
            console.error('do not have branch:'+ key)
          //console.log('.')
        })
      })
      s.on('receive', function (key, obj) {
        //console.error('<<<', key, obj)
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

