
var Merkle = require('../')
var table = require('../util').table

var tape = require('tape')
var expected = require('./expected')
tape('correct leaves', function (t) {

  var a = table(4)

  var m = Merkle.tree(a)

//  console.log(JSON.stringify(m, null, 2))
//  console.log(m.leaves())

  t.deepEqual(m.leaves(), a)
  t.equal(m.digest(), "67d49ee3e0571a9c80dafad5ac95ba3ea04b7340")
  t.deepEqual(m.toJSON(), expected[4])
  t.end()
})

tape('random input', function (t) {
  var a = table(4).sort(function (a) {
    return Math.random() - 0.5
  })
  var m = Merkle.tree(a)
  t.deepEqual(m.leaves(), a.sort())
//  console.log(JSON.stringify(m, null, 2))
  t.deepEqual(m.toJSON(), expected[4])
  t.end()
})

tape('subtree', function (t) {

  var a = table(4)
  var m = Merkle.tree(a)

  var _m = m.subtree('')
  t.strictEqual(_m, m)

  var _m = m.subtree('c')
  t.equal(_m.digest(), "006018cf72c4d2b58ba2543e3c73829f5cb6fe19")
  var _m = m.subtree('5')
  t.equal(_m.digest(), 'a9ef02c047067ecd8207e3dad75076589fa5ad3c')
  t.end()
})

var hash = require('../util').hash

tape('diff', function (t) {
  var a = table(4)
  var m = Merkle.tree(a)
  var n = Merkle.tree(a)
  n.update(hash('11'))

  t.notEqual(m.digest(), n.digest())
  var c
  console.log(c = m.diff(n.top()))
  var d = []
  c.forEach(function (e) {
    console.log('e', e)
    d.push(n.diff(e))
  })
  console.log(d)

  t.end()
})


