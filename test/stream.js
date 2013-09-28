
var Merkle = require('../')
var createStream = require('../stream')
var u      = require('../util')
var hash   = u.hash
var tape   = require('tape')
var table  = u.table

tape('stream1', function (t) {
  var ary = table(4)
  var waiting = []
  var sending = []
  var A = Merkle.tree(ary)
  var B = Merkle.tree(ary)
  var h = hash('11')
  B.update(h)

  var a = createStream(A)
  var b = createStream(B)

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

  a.on('sync', function (hash) {
    t.equal(A.digest(), B.digest())
    t.end()
  })

  t.notEqual(A.digest(), B.digest())
  b.send(h, '11')

})

tape('stream2', function (t) {

  var ary = table(4)
  var waiting = []
  var sending = []
  var A = Merkle.tree(ary)
  var B = Merkle.tree(ary)
  var h = hash('11')
  var h2 = hash('12')
  B.update(h)
  A.update(h2)

  var a = createStream(A)
  var b = createStream(B)

  a.pipe(b).pipe(a)
  //start immediately
  a.resume(); b.resume()

  var n = 2
  a.on('sync', next)
  b.on('sync', next)

  t.notEqual(A.digest(), B.digest())
  b.send(h, '11')
  a.send(h2, '12')

  function next () {
    if(--n) return
    t.equal(A.digest(), B.digest())
    t.end()
  }
})
