
var tape = require('tape')

var util = require('../util')
var tree = require('../')

tape('create hashes', function (t) {

  var a = util.table(8)
  t.equal(a.length, 256)

  a.forEach(function (e) {
//    t.equal(typeof e, 'string')
  //  t.equal(e.length, 40)
  })

  a = util.table(16)
  t.equal(a.length, 65536)
  t.end()
})


