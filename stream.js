var duplex = require('duplex')

function isString (s) {
  return 'string' === typeof s
}

module.exports = function (merkle) {

  var d = duplex()

  d.send = function (hash, obj) {
    d._data({hash: hash, value: obj})
  }

  d.recieve = function (hash) {
    merkle.update(hash)
  }

  d.on('_data', function (data) {
    if(isString(data)) {
      if(merkle.digest() == data) {
        d.emit('sync', data)
      } else {
        d.emit('diff', '')
        d._data(['', merkle.expand()])
      }
    } else if(Array.isArray(data)) {
      var pre = data[0]
      var hashes = data[1]
      var tree = merkle.subtree(pre)

      function prefix(e, parent) {
        if(isString(e))
          return e.substring(0, parent.depth + 1)
        else
          return e.prefix()
      }

      function digest (h) {
        return h.digest ? h.digest() : h
      }

      var a = []
      tree.tree.forEach(function (e) {
        var p = prefix(e, tree)
        var h = hashes[p]
        if(h) {
          if(digest(e) === h) {
            console.log('matches', h)
            d.emit('branch_sync', p, h)
          } else {
            console.log('missing', prefix(e, tree), digest(e))
            d._data([e.prefix(), e.expand()])
          }
          delete hashes[p]
        } else {
          console.log('SEND', prefix(e, tree), digest(e))
          d.emit('send_branch', prefix(e, tree), digest(e))
        }
      })

      for(var k in hashes) {
        //hmm... use await to detect when everything has been replicated?
        console.log('AWAIT', k, hashes[k])
        d.emit('await_branch', k, hashes[k])
      }
    }
  })

  // and then stream the actual data somehow...
  // one easy way would just be to put the merkle tree inside
  // a mux-demux, and stream each object as a separate stream.
  // that would work well for replicating files, certainly.

  // otherwise, hmm, maybe just expose a send method on the stream?
  // so that other data can be sent?

  d._data(merkle.digest())
  return d
}
