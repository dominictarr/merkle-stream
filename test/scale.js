
var tape = require('tape')

var util = require('../util')
var tree = require('../slow')
var Merkle = require('../')
tree = Merkle.tree

function count (tree) {
  var s = 0
  if('string' === typeof tree)
    return 1
  else
    for (var k in tree.tree) {
      s += count(tree.tree[k])
    }
  return s + 1
}

console.log('i, N, t, t/N, t/(N*log(N)), _t/t, H')
var _t =  0.0001
for(var i = 1; i <= 20; i++) {

  var a = util.table(i, 'binary')
  var start = Date.now()
  var g = tree(a)
  var t = Date.now() - start || 0.0001
  var N = 1 << i
  console.log([i, N, t, t/N, t / (N*Math.log(N)), _t/t, count(g)].join(', '))
//  console.log(JSON.stringify(g, null, 2))
  _t = t
}
//console.log(JSON.stringify(g, null, 2))
