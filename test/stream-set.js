
var Set = require('../example')
var tape = require('tape')
var u = require('../util')

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

    t.equal(s.tree.leaves().length, o + n)
    t.equal(z.tree.leaves().length, o + m)

    log('********************************', s.tree.leaves().length, z.tree.leaves().length)
    log(JSON.stringify(s.tree.toJSON(), null, 2))
    log(JSON.stringify(z.tree.toJSON(), null, 2))
    log('********************************')


    var ss = s.createStream()
    var zs = z.createStream()
    ss.pipe(zs).pipe(ss)

    ss.on('data', log.bind(console, 'S>'))
    zs.on('data', log.bind(console, 'Z>'))

    ss.resume(); zs.resume()
    log(s.tree.digest(), z.tree.digest())
    if(s.tree.leaves().length != z.tree.leaves().length) {
      log('********************************', s.tree.leaves().length, z.tree.leaves().length)
      log(JSON.stringify(s.tree.toJSON(), null, 2))
      log(JSON.stringify(z.tree.toJSON(), null, 2))
      log('********************************')
    }
      
    t.deepEqual(s.tree.leaves(), z.tree.leaves())
    t.equal(s.tree.digest(), z.tree.digest())
    t.end()
  }
}
             //   shared/left/right
tape('stream-set, 10/4/4', sets(10, 4, 4))
tape('stream-set, 100/40/0', sets(100, 40, 0))
tape('stream-set, 0/40/0', sets(0, 40, 0))
tape('stream-set, 0/0/6', sets(0, 0, 6))
tape('stream-set, 0/6/6', sets(0, 6, 6))
tape('stream-set, 0/50/50', sets(0, 50, 50))
tape('stream-set, 100/50/50', sets(100, 50, 50))

//tape('stream-set, small', function (t) {
//  var s = Set()
//  var z = Set()
//  for(var i = 0; i < 16; i++)
//    s.add(i), z.add(i)
//  for(var i = 0; i < 4; i++)
//    s.add(2 * i + 16), z.add(2 * i + 17)
//
//    var ss = s.createStream()
//    var zs = z.createStream()
//    ss.pipe(zs).pipe(ss)
//    ss.resume(); zs.resume()
//    console.log(s.tree.digest(), z.tree.digest())
//
//    t.deepEqual(s.tree.leaves(), z.tree.leaves())
//    t.equal(s.tree.digest(), z.tree.digest())
//    t.end()
//})

tape('stream-set, single', function (t) {
  var s = Set()
  var z = Set()
    s.add(1)
  //  s.add(2)
  //  s.add(3)

  //console.log('S', JSON.stringify(s.tree.toJSON(), null, 2))
  //console.log('Z', JSON.stringify(z.tree.toJSON(), null, 2))

    var ss = s.createStream()
    var zs = z.createStream()
    ss.pipe(zs).pipe(ss)
    ss.resume(); zs.resume()
    console.log(s.tree.digest(), z.tree.digest())

    t.deepEqual(s.tree.leaves(), z.tree.leaves())
    t.equal(s.tree.digest(), z.tree.digest())
    t.end()
})


tape('stream-set, full vs. empty', function (t) {
  var s = Set()
  var z = Set()
  for(var i = 0; i < 1; i++)
    s.add(i)

    var ss = s.createStream()
    var zs = z.createStream()
    ss.on('data', console.log.bind(null, 'S>'))
    zs.on('data', console.log.bind(null, 'Z>'))
    ss.pipe(zs).pipe(ss)
    ss.resume(); zs.resume()
    console.log(s.tree.digest(), z.tree.digest())

    t.deepEqual(s.tree.leaves(), z.tree.leaves())
    t.equal(s.tree.digest(), z.tree.digest())
    t.end()
})

