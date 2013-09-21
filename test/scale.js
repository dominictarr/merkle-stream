
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
var crypto = require('crypto')
function hash (n) {
  n = (n | 0).toString(16)
  if(n.length % 2)
    n = '0' + n
  return crypto.createHash('sha1').update(n, 'hex').digest('hex')
}

console.log('N, t, N/t')

var _t =  0.0001
var sqrt2 = Math.pow(2, 0.25)
var N = 1, j = 0
var a = []
//for(var i = 1; i <= 20; i ++) {
while(N < (1 << 21)) {
  while(a.length < N)
    a.push(hash(j++))
  var start = Date.now()
  var g = tree(a)
  
  var t = Date.now() - start || 0.0001
  var d = g.digest()
  console.log([~~N, t, N/t].join(', '))
  _t = t
  N = N * sqrt2
}

