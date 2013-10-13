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
  var c = 0
    function compare (a, b) {
      if(a.digest() === b.digest())
        return
      else if(a.count > 1 && b.count > 1) {
        c ++ 
        for(var i = 0; i < 16; i ++) {
          var _a = a.tree[i], _b = b.tree[i]
          if(_a && _b) {
            if(_a && _b && _a.digest() !== _b.digest()) {
              console.log('   ',[_a.prefix(), _a.digest(), _a.count, _a.length])
              console.log('===', [_b.pre, _b.digest(), _b.count, _b.length])
              compare(_a, _b)
            }
          }
        }
      }
    }

    compare(s.tree, z.tree)

    console.log('COMPARISONS', c)
    t.end()
  }

}

tape('stream-set, 10/4/4', sets(10, 4, 4))
tape('stream-set, 0/0/1', sets(0, 0, 1))
tape('stream-set, 1/0/0', sets(1, 0, 0))
tape('stream-set, 100/40/0', sets(100, 40, 0))
tape('stream-set, 100/40/0', sets(10000, 14, 0))
tape('stream-set, 100/40/0', sets(100000, 140, 0))
//tape('stream-set, 0/40/0', sets(0, 40, 0))
//tape('stream-set, 0/0/6', sets(0, 0, 6))

