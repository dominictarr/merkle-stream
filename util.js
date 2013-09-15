//generate an array of ordered hashes.
var crypto = require('crypto')
var hashes = 0
var OBJECTS = 0
function hash(x) {
  hashes ++
  return crypto.createHash('sha1').update(x, 'hex').digest('hex')
}

exports.table = table
exports.maxPrefix = maxPrefix
exports.startsWith = startsWith
exports.group = group
exports.merkleize = merkleize
exports.tree = tree

function startsWith(a, prefix) {
  OBJECTS ++ 
  var o = {}
  if(Array.isArray(a)) {
    for(var i in a)
      o[a[i].substring(0, prefix)] = a[i]
  } else {
    for(var k in a)
      o[k.substring(0, prefix)] = a[k]
  }
  return o
}

function group(o, l, iter) {
  var n = {}, cur
  OBJECTS ++ 
  function emit(k) {
    iter(k, n)
    OBJECTS ++ 
    n = {}
  }

  for(var k in o) {
    var pre
    if(!cur)
      pre = cur = k.substring(0, l)
    else
      pre = k.substring(0, l)
    if(cur != pre) {
      emit(cur, n)
      cur = pre
    }
    n[k] = o[k]
  }
  emit(cur, n)
}

function tree (a) {
  var m = maxPrefix(a)
  console.log('MAX', m)
  var o = startsWith(a, m)
  function recurse(o, m) {
    if(m === 0) return o
    OBJECTS ++
    var g = {}
    group(o, --m, function (key, group) {
      g[key] = merkleize(group)
    })
    if(!m)
      return g
    else
      return recurse(g, m)
  }

  return recurse(o, m)['']
//  return 'string' === typeof g ? {hash: g} : g
}

function getHash(obj) {

}

function oneKey(obj) {
  var i = 0
  for(var k in obj) {
    f = k
    if(i++) return false
  }
  return i === 1
}

function first (o) {
  for(var k in o)
    return k
}

function merkleize (obj) {  
  var keys = Object.keys(obj)

//  var h = '', n = 0
  var h = keys.map(function (k) {
    var v = obj[k]
//    n ++
    return v.hash || v //('string' === typeof v ? v : v.hash)
  })
  //.join('')
 
  return h.length == 1 ? h[0] : OBJECTS ++, {
    hash: hash(h.join('')), tree: obj
  }
}


function table (bits) {
  var max = 1 << bits
  var a = []
  for(var i = 0; i < max; i++) {
    var x = i.toString(16)
    if(x.length % 2)
      x = '0' + ''+x
    a.push(hash(x))
  }
  return a.sort()
}


//console.log(a)
START = Date.now()

function prefix(a, b) {
  if(a == b)
    return a.length
  for(var i in a)
    if(a[i] !== b[i])
      return 1 + +i
}

function maxPrefix (a) {
  var prev, max = 0
  a.forEach(function (k) {
    if(!prev)
      prev = k
    else {
      var l = prefix(prev, k)
      var a = prev.substring(0, l), b = k.substring(0, l)
      if(a === b)
        throw new Error(prev + ' === ' + k)
      max = Math.max(max, l)
    }
    prev = k
  })
  return max
}


if(!module.parent) {
  var a = table(12)

  START = Date.now()
//  console.log(maxPrefix(a))
  var H = hashes
  console.log(hashes)
  var g = tree(a)
  console.log(JSON.stringify(g, null, 2))
  console.log(Date.now() - START, hashes - H, OBJECTS)
}
//
// 331290 / 65536
//5.055084228515625
