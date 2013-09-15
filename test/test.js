
var tape = require('tape')

var util = require('../util')

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

tape('prefix', function (t) {

  //maxPrefix should find the longest uniq prefix

  var a = util.table(8)

  var m = util.maxPrefix(a)
  var uniq = a.map(function (e) {
    return e.substring(0, m)
  })

  while(uniq.length) {
    var u = uniq.shift()
    if(~uniq.indexOf(u))
      t.fail('was not unique', u)
  }

  t.end()
})

tape('startsWith', function (t) {

  var a = util.table(8)
  var m = util.maxPrefix(a)
  var o = util.startsWith(a, m)
  t.equal(a.length, Object.keys(o).length)
  t.end()
})

tape('group', function (t) {
  var a = util.table(8)
  var g = util.tree(a)
  console.log(JSON.stringify(g, null, 2))
  t.end()
})

tape('tiny-group', function (t) {
  var a = util.table(0)
  var g = util.tree(a)
  console.log(g)
  t.equal(typeof g, 'string')
  t.end()
//  console.log(JSON.stringify(g, null, 2))
})

