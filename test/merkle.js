
var Merkle = require('../')
var table = require('../util').table

var tape = require('tape')
var expected = require('./expected')
tape('correct leaves', function (t) {

  var a = table(4)

  var m = Merkle.tree(a)

  console.log(JSON.stringify(m, null, 2))
  console.log(m.leaves())

  t.deepEqual(m.leaves(), a)
  t.deepEqual(m.toJSON(), expected[4])
  t.end()
})

tape('random input', function (t) {
  var a = table(4).sort(function (a) {
    return Math.random() - 0.5
  })
  var m = Merkle.tree(a)
  t.deepEqual(m.leaves(), a.sort())
  console.log(JSON.stringify(m, null, 2))
  t.deepEqual(m.toJSON(), expected[4])
  t.end()
})
