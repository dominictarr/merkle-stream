
var Set = require('../compare')
var tape = require('tape')
var u = require('../util')
var through = require('through')

function clone () {
  return through(function (data) {
    return this.queue(JSON.parse(JSON.stringify(data)))
  })
}

//transform an array of keys into a object [key] = true
function toKeys (a) {
  var o = {}
  a.forEach(function (k) {
    o[k] = true
  })
  return o
}

function union (a, b) {
  a = toKeys(a); b = toKeys(b)
  var o = {}
  for(var k in a) {
    if (a[k] && b[k])
      o[k] = true
  }
  return Object.keys(o).sort()
}

//get keys in a that are not in b
function missing (a, b) {
  a = toKeys(a.sort()); b = toKeys(b.sort())
  var o = {}
  for(var k in a) {
    if (a[k] && !b[k])
      o[k] = true
  }
  return Object.keys(o).sort()
}

var DEBUG = process.env.DEBUG

var log = DEBUG ? console.log : function() {}

function sets (o, n, m) {
  return function (t) {
    var s = Set()
    var z = Set()
    for(var i = 0; i < o; i++)
      s.add(i), z.add(i)
    for(var i = 0; i < n; i++)
      s.add(2 * (i + o))
    for(var i = 0; i < m; i++)
      z.add(2 * (i + o) + 1)

    log(s.set, z.set)

    t.deepEqual(Object.keys(s.set).sort(), s.tree.leaves().sort())
    t.deepEqual(Object.keys(z.set).sort(), z.tree.leaves().sort())

    var missing_z = missing(s.tree.leaves().sort(), z.tree.leaves().sort())
    var missing_s = missing(z.tree.leaves().sort(), s.tree.leaves().sort())

    log('in s missing from z', missing_z)
    log('in z missing from s', missing_s)

    log('********************************', s.tree.leaves().length, z.tree.leaves().length)
    log(JSON.stringify(s.tree.toJSON(), null, 2))
    log(JSON.stringify(z.tree.toJSON(), null, 2))
    log('********************************')

    var ss = s.createStream()
    var zs = z.createStream()
    ss.pipe(clone()).pipe(zs).pipe(clone()).pipe(ss)

    ss.on('data', log.bind(console, 'S>'))
    zs.on('data', log.bind(console, 'Z>'))

    ss.resume(); zs.resume()
  
    t.deepEqual(s.missing.sort(), missing_z)
    t.deepEqual(z.missing.sort(), missing_s)
    
//    t.deepEqual(s.tree.leaves(), z.tree.leaves())
//    t.equal(s.tree.digest(), z.tree.digest())
    t.end()
  }
}
             //   shared/left/right
tape('stream-set, 0/1/1', sets(0, 1, 1))
tape('stream-set, 10/4/4', sets(10, 4, 4))
tape('stream-set, 0/0/1', sets(0, 0, 1))
tape('stream-set, 1/0/0', sets(1, 0, 0))
tape('stream-set, 100/40/0', sets(100, 40, 0))
tape('stream-set, 0/40/0', sets(0, 40, 0))
tape('stream-set, 0/0/6', sets(0, 0, 6))
tape('stream-set, 0/6/6', sets(0, 6, 6))
tape('stream-set, 0/7/7', sets(0, 7, 7))
tape('stream-set, 0/7/7', sets(0, 8, 8))
tape('stream-set, 0/8/8', sets(0, 8, 8))
tape('stream-set, 0/50/50', sets(0, 50, 50))
tape('stream-set, 100/50/50', sets(100, 50, 50))


