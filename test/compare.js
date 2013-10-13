
var Set = require('../compare')
var tape = require('tape')
var u = require('../util')
var through = require('through')
var delay = require('delay-stream')

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

function sets (o, n, m, sync) {
  return function (t) {
    var s = Set()
    var z = Set()
    for(var i = 0; i < o; i++)
      s.add(i), z.add(i)
    for(var i = 0; i < n; i++)
      s.add(o + (2 * i))
    for(var i = 0; i < m; i++)
      z.add(o + (2 * i) + 1)

    log(s.set, z.set)

    t.deepEqual(Object.keys(s.set).sort(), s.tree.leaves().sort())
    t.deepEqual(Object.keys(z.set).sort(), z.tree.leaves().sort())

    var missing_z = missing(s.tree.leaves().sort(), z.tree.leaves().sort())
    var missing_s = missing(z.tree.leaves().sort(), s.tree.leaves().sort())

    t.equal(missing_z.length, n)
    t.equal(missing_s.length, m)

    log('in s missing from z', missing_z)
    log('in z missing from s', missing_s)

    log('********************************', s.tree.leaves().length, z.tree.leaves().length)
    log(JSON.stringify(s.tree.toJSON(), null, 2))
    log(JSON.stringify(z.tree.toJSON(), null, 2))
    log('********************************')

    var ss = s.createStream()
    var zs = z.createStream()
    var us = false, uz = false, N = 2, sm = 0, zm = 0

    ss.on('union', function () {
    //  console.log('S UNION!')
      if(us) throw new Error('S, only union once')
      us = true
      next()
    })
    zs.on('union', function () {
  //    console.log('Z UNION!')
      if(uz) throw new Error('Z, only union once')
      uz = true
      next()
    })


    ss.on('data', log.bind(console, 'S>'))
    zs.on('data', log.bind(console, 'Z>'))
    ss.on('data', function () {sm ++})
    zs.on('data', function () {zm ++})

    ss
      .pipe(clone())
//      .pipe(delay())
      .pipe(zs)
      .pipe(clone())
  //    .pipe(delay())
      .pipe(ss)

    zs.resume()
    ss.resume()

    function next(){
      if(N < 0)
        throw new Error('too many unions')
      if(--N) return
      console.log('UNION')
    }

    t.deepEqual(s.missing.sort(), missing_z)
    t.deepEqual(z.missing.sort(), missing_s)

    t.equal(s.expect, s.response)
    t.equal(z.expect, z.response)

    console.log('S maybe/expect', ss.maybe, ss.expect, ss.response)
    console.log('Z maybe/expect', zs.maybe, zs.expect, zs.response)
    console.log('Messages (s/z)', sm, zm)
    console.log('Nodes    (s/z)', s.tree.count, z.tree.count)
    console.log('MISSING? (s/z)', missing_z.length, missing_s.length)
    console.log('Z maybe/expect', zs.maybe, zs.expect, zs.response)

//      console.log(ss.maybes.map(function (e) {
//        return e.digest()
//      }), zs.otherMaybes)
//      console.log(zs.maybes.map(function (e) {
//        return e.digest()
//      }), ss.otherMaybes)

//    t.equal(ss.expect, 0, 'Union S')
//    t.equal(zs.expect, 0, 'Union Z')

      console.log('********************')
      t.end()

  }
}
             //   shared/left/right
//tape('stream-set, 0/1/1', sets(0, 1, 1))
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

//tape('stream-set, 100/5011/5020', sets(100, 5011, 5020))
//tape('stream-set, 1000/11/5020', sets(1000, 11, 5020))
//tape('stream-set, 1000/11/5020', sets(1000, 1, 1))
//tape('stream-set, 1000/1000/1000', sets(1000, 1000, 1000))
//tape('stream-set, 1000/100/100', sets(10000, 100, 100))
//tape('stream-set, 1000/100/10', sets(10000, 100, 0))

tape('stream-set, 1000/11/5020', sets(10000, 14, 0))


