
var Set = require('../compare')
var through = require('through')
var delay = require('delay-stream')
var assert = require('assert')

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

//transform an array of keys into a object [key] = true
function toKeys (a) {
  var o = {}
  a.forEach(function (k) {
    o[k] = true
  })
  return o
}


var test = module.exports = function (o, n, m, cb) {
  var sync = false, d = 0
  var DATA = 0
  var N = 2
  var s = Set()
  var z = Set()
  for(var i = 0; i < o; i++)
    s.add(i), z.add(i)
  for(var i = 0; i < n; i++)
    s.add(o + (2 * i))
  for(var i = 0; i < m; i++)
    z.add(o + (2 * i) + 1)

  var ss = s.createStream()
  var zs = z.createStream()
  var us = false, uz = false, N = 2, sm = 0, zm = 0

  var missing_z = missing(s.tree.leaves().sort(), z.tree.leaves().sort())
  var missing_s = missing(z.tree.leaves().sort(), s.tree.leaves().sort())

  var START = Date.now()

  function count (data) {
    DATA += JSON.stringify(data).length
  }

  function clone () {
    return through(function (data) {
      var d = JSON.stringify(data)
      DATA += d.length
      return this.queue(JSON.parse(d))
    })
  }


  ss
    .pipe(clone())
    .pipe(delay(d || false))
    .pipe(zs)
    .pipe(clone())
    .pipe(delay(d || false))
    .pipe(ss)

  zs.resume()
  ss.resume()

  zs.on('union', next)
  ss.on('union', next)

  function next(){
    if(N < 0)
      throw new Error('too many unions')
    if(--N) return
    check()
  }

  function check () {
    var END = Date.now()
    //verify
    assert.deepEqual(s.missing.sort(), missing_z)
    assert.deepEqual(z.missing.sort(), missing_s)
    console.log([o / (n + m + o), END - START, (DATA/((o*2) + n + m))/40].join(', '))
    cb()
  }
}


if(!module.parent) {
  console.log('intersection size (%), Time to Replicate (ms), bandwidth (bytes)')

  var start = 3000, step = 50
  var tests = []
  for(n = 0; n <= start; n += step) {
    tests.push([n, start - n, 0])
  }

  console.error(tests)

//  var tests = [
//    [   0, 3000, 0],
//    [ 200, 2800, 0],
//    [ 400, 2600, 0],
//    [ 600, 2400, 0],
//    [ 800, 2200, 0],
//    [1000, 2000, 0],
//    [1200, 1800, 0],
//    [1400, 1600, 0],
//    [1600, 1400, 0],
//    [1800, 1200, 0],
//    [2000, 1000, 0],
//    [2200,  800, 0],
//    [2400,  600, 0],
//    [2600,  400, 0],
//    [2800,  200, 0],
//    [3000,    0, 0]
//  ]
//
  ;(function next () {
  
    var t = tests.shift()
    if(!t) return
    test(t.shift()*10, t.shift()*10, t.shift(), function () {
      next()
    })

  }())
}

