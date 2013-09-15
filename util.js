

//generate an array of ordered hashes.
var crypto = require('crypto')
var hashes = 0
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
  function emit(k) {
    iter(k, n)
    n = {}
  }

  for(var k in o) {
    if(!cur)
      cur = k.substring(0, l)
    var pre = k.substring(0, l)
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
  var o = startsWith(a, m)
  function recurse(o, m) {
    if(m == 0) return o
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

function merkleize (obj) {  
  var keys = Object.keys(obj)
  if(keys.length === 1)
    return obj[keys[0]]

  var h = keys.map(function (e) {
    var v = obj[e]
    if('string' === typeof v)
      return v
    return v.hash
  }).join('')

  return {
    hash: hash(h), tree: obj
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
/*
function each(a, iter) {
  for(var i in a)
    iter(a[i], i, a)
}

function tree (a, len) {
  var cur, acc = [], result = {}, tree = [], tree2 = {}
  function key (r, k) {
    return 'object' === typeof r ? k.substring(0, len) : r.substring(0, len)
  }

  function value (r) {
    return 'object' === typeof r ? r.hash : r
  }

  each(a, function (r, k) {
    if(!cur) {
      cur = key(r, k)
      acc = [], tree = [], tree2 = {}
    }
    var pre = key(r, k)
    if(pre === cur) {
      acc.push(value(r))
      tree.push(r)
      tree2[cur] = r
    } else {
      var _tree = 
          tree.length > 1
          ? levelOne(tree, len + 1)
          : tree

      if(acc.length == 1)
        result[cur] = acc[0] //({pre: cur, hash: acc[0]})
      else {
        result[cur] = ({pre: cur, hash: hash(acc.join('')), tree: _tree})
      }
      cur = pre
      acc = [value(r)]; tree = [r]; tree2 = {}
    }
  })
  console.log(cur, acc, tree)
  return result
}

function wholeTree(a, depth) {
  //console.log(tree)
  if(depth == null)
    depth = maxPrefix(a)
  if(depth === 1)
    return tree(a, 1)
  return wholeTree(tree(a, depth), depth - 1)
}

//var result = wholeTree(a, 3)

function levelOne(a, m) {
  var t = {}//tree(a, m)
  var o = {}
  for(var i in a) {
    var v = a[i].pre || a[i]
    if(!v.substring) {
      console.log(a[i])
    }

    t[v.substring(0, m)] = a[i]
  }
  if(a.length != Object.keys(t).length) {
    throw new Error('wrong length')
  }
  return t
}
*/
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
  var a = table(16)

  START = Date.now()
  console.log(maxPrefix(a))
  var H = hashes
  console.log(hashes)
  var g = tree(a)
//  console.log(JSON.stringify(, null, 2))
  console.log(Date.now() - START, hashes - H)
}
