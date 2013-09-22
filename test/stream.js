
var Merkle = require('../')
var createStream = require('../stream')
var u      = require('../util')
var hash   = u.hash
var tape   = require('tape')
var table  = u.table

function flatten (a) {
  return a.reduce(function (a, b) {
    return a.concat(b)
  }, [])
}

tape('diff', function (t) {
  var ary = table(4)
  var waiting = []
  var sending = []
  var m = Merkle.tree(ary)
  var n = Merkle.tree(ary)
  var h = hash('11')
  n.update(h)

  var a = createStream(n)
  var b = createStream(m)

  a.on('send_branch', function (pre, hash) {
    sending.push({pre: pre, hash: hash})
  })
  b.on('await_branch', function (pre, hash) {
    waiting.push({pre: pre, hash: hash})
  })

  a.pipe(b).pipe(a)
  //start immediately
  a.resume(); b.resume()

  t.deepEqual(waiting, sending)
  console.log('waiting', waiting)

  t.end()

})
