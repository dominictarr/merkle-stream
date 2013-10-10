var Set = require('../example')
var tape = require('tape')
var u = require('../util')

tape('stream-set, less small', function (t) {
  var s = Set()
  var z = Set()
  for(var i = 0; i < 16; i++)
    s.add(i), z.add(i)
  for(var i = 0; i < 8; i++)
    s.add(2 * i + 16), z.add(2 * i + 17)

    var ss = s.createStream()
    var zs = z.createStream()
    ss.pipe(zs).pipe(ss)
    ss.resume(); zs.resume()
    console.log(s.tree.digest(), z.tree.digest())

    t.deepEqual(s.tree.leaves(), z.tree.leaves())
    t.equal(s.tree.digest(), z.tree.digest())

    for(var k in s.set)
      if(z.set[k] == null)
        console.log('z is missing', k, s.set[k])

    for(var k in z.set)
      if(s.set[k] == null)
        console.log('s is missing', k, z.set[k])

    t.deepEqual(Object.keys(z.set).length, Object.keys(s.set).length)

    t.deepEqual(Object.keys(z.set).sort(), Object.keys(s.set).sort())
    
    t.end()
})

