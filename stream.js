var duplex = require('duplex')

function isString (s) {
  return 'string' === typeof s
}

module.exports = function (merkle) {

  // how to detect when the two sides are in sync?
  // probably the best is to send a message
  // with the new digest, so each side can check they have
  // the same data.

  // but when to send that message, exactly?
  // we should be able to calculate the number of messages
  // that we expect to see.
  // could build up a partial tree of the other side,
  // to track what we are waiting for?
  // and then, that could be updated as we go back through it...

  // that would mean that each replication needs it's own
  // tree.., hmm, it's probably fine for now though.
  // and could clone the other tree as you work your way up it,
  // without cloning the parts that are known to be shared...

  var d = duplex()

  d.waiting = {}

  d.send = function (hash, obj) {
    d._data({key: hash, value: obj})
  }

  d.recieve = function (hash) {
    merkle.update(hash)
    //hmm, this is overkill actually,
    //but it could be used to make a progess bar.
    console.log('get?')
    var tree = merkle.get(hash)
    var pre = tree.pre, h
    do {
      if(h = d.waiting[pre]) {
        if(hash === merkle.subtree(pre).digest()) {
          delete d.waiting[pre]
          break;
        }
      }
      pre = pre.substring(0, pre.length - 1)
    } while(pre.length);

    for(var k in d.waiting)
      return

    //if there are no more waiting messages,
    //then emit sync!
    console.log('sync?')
    d.emit('sync', merkle.digest())
  }

  d.on('await_branch', function (pre, hash) {
//

  })

  d.on('_data', function (data) {
    //this occurs only on the top hash.
    if(isString(data)) {

      if(merkle.digest() == data) {
        d.emit('sync', data)
      } else {
        d.target = data
        d.emit('diff', '')
        d._data(['', merkle.expand()])
      }

    } else if(Array.isArray(data)) {
      var pre = data[0]
      var hashes = data[1]
      var tree = merkle.subtree(pre)

      var a = []
      if(tree.leaf) {
        console.log('LEAF', data)
      } 
      tree.tree.forEach(function (e) {
        var p = e.prefix()
        var h = hashes[p]
        if(h) {
          if(e.digest() === h) {
            console.log('matches', h)
            //mark synced branches
            e.sync = true
            d.emit('branch_sync', p, h)
          } else {
            console.log('different', e.prefix(), e.digest())
            //how to mark a different item?
            if(e.leaf) {
              console.log(data)
              console.log('DIFF LEAF', p, h, e.digest())
              // what if I just sent the key like this?
              d._data([e.prefix, e.digest()])
              // what if the subtree actually includes this hash?
              // other side should send everything except this object.
              throw new Error('not implemented yet. different with leaf')
            }
            d._data([e.prefix(), e.expand()])
          }
          delete hashes[p]
        } else {
          console.log('SEND', e.prefix(), e.digest())
          //this branch will be in sync, once it's recieved on the other side.
          e.sync = true
          d.emit('send_branch', e.prefix(), e.digest())
        }
      })

      tree.sync = 0
      for(var k in hashes) {
        //hmm... use await to detect when everything has been replicated?
        //create the Merkle node already,
        //and mark it's target. then, when it's digest becomes correct,
        //we will know.

        //then, when we update a branch with an expectation,
        //after updating it, compute it's digest, to see if it's synced.
        //if it is, mark as sync, and emit sync_branch

        //when inserting children, don't update their 

        tree._expect(k, hashes[k], function (pre, hash) {
          d.emit('branch_sync', pre, hash)
        })
        console.log('AWAIT', k, hashes[k])
        d.emit('await_branch', k, hashes[k])
      }
    } else if(data.key) {
      d.recieve(data.key, data.value)
      d.emit('recieve', data.key, data.value)
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
