

//generate an array of ordered hashes.
var crypto = require('crypto')
var hashes = 0
function hash(x) {
  hashes ++
  return crypto.createHash('sha1').update(x, 'hex').digest('hex')
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

function each(a, iter) {
  for(var i in a)
    iter(a[i], i, a)
}

function tree (a, len) {
  var cur, acc = [], result = {}, tree = []
  function key (r, k) {
    return 'object' === typeof r ? k.substring(0, len) : r.substring(0, len)
  }

  function value (r) {
    return 'object' === typeof r ? r.hash : r
  }

  each(a, function (r, k) {
    if(!cur) {
      cur = key(r, k)
      acc = [], tree = []
    }
    var pre = key(r, k)
    if(pre === cur) {
      acc.push(value(r))
      tree.push(r)
    } else {
      var _tree = 
          tree.length > 1
          ? levelOne(tree, len + 1)
          : tree

      //console.log(acc.length, acc)
      if(acc.length == 1)
        result[cur] = acc[0] //({pre: cur, hash: acc[0]})
      else {
        console.log(cur, acc, r)
        result[cur] = ({pre: cur, hash: hash(acc.join('')), tree: _tree})
      }
      cur = pre
      acc = [value(r)]; tree = [r]
    }
  })
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
function prefix(a, b) {
  if(a == b)
    return a.length
  for(var i in a)
    if(a[i] !== b[i])
      return 1 + +i
}

function levelOne(a, m) {
//  console.log(a)

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
    console.log(a)
    console.log(t)
    throw new Error('wrong length')
  }
  return t
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

var a = table(8)

console.log(Date.now() - START, hashes)
console.log(maxPrefix(a))
var m = maxPrefix(a)
//var result = tree(tree(tree(a, m), m - 1), m - 2)
var result = wholeTree(a)
console.log(JSON.stringify(result, null, 2))

