
var Merkle = require('../')
var table = require('../util').table

var tape = require('tape')

tape('correct leaves', function (t) {

  var a = table(4)

  var m = Merkle.tree(a)

  console.log(JSON.stringify(m, null, 2))
  console.log(m.leaves())

  t.deepEqual(a, m.leaves())
  t.end()
})

tape('random input', function (t) {
  var a = table(4).sort(function (a) {
    return Math.random() - 0.5
  })
  var m = Merkle.tree(a)
  t.deepEqual(a.sort(), m.leaves())
  t.end()
})
