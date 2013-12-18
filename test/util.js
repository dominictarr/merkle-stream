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

module.exports = sets

function sets (o, n, m, sync, d) {
//  var sync = !async
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

    if('number' === typeof d) {
      ss
        .pipe(clone())
        .pipe(delay(d || false))
        .pipe(zs)
        .pipe(clone())
        .pipe(delay(d || false))
        .pipe(ss)
    } else {
      ss
        .pipe(clone())
        .pipe(zs)
        .pipe(clone())
        .pipe(ss)
    }

    zs.resume()
    ss.resume()

    function next(){
      if(sync) return
      if(N < 0)
        throw new Error('too many unions')
      if(--N) return
      console.log('UNION')
      check()
    }

    if(sync) check()

    function check () {
      console.log(s.missing)

      t.deepEqual(s.missing.sort(), missing_z)
      t.deepEqual(z.missing.sort(), missing_s)

      log('S MISSING', s.missing.sort())
      log('Z MISSING', z.missing.sort())


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
}

function combinations (parts) {
  var p = parts.slice()
  if(p.length === 1) {
    var x = []
    var m = p[0]
    while(m --)
    x.push([m])
    console.log(x)
    return x
  }

//  if(x > 0) combinations(x - 1, y, z)
//  if(y > 0) combinations(x, y - 1, z)
//  if(z > 0) combinations(x, y, z - 1)
//  console.log(x, y, z)
}

if(!module.parent) {
  console.log(combinations([2,2]))
}
