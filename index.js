var crypto = require('crypto')

function Merkle (depth, hash) {
  this.hash = hash
  this.tree = []
  this.pre = null
  if(hash) {
    this.tree[intAt(hash, depth)] = hash
    this.pre = hash.substring(0, depth)
  }
  this.depth = depth || 0
  this._digest = false
}

var proto = Merkle.prototype

function intAt(hash, depth) {

  //parse 'a' as 10
  var i = hash.charCodeAt(depth) - 87

  //but if it was a number, make it count from 0
  return (i < 0) ? i + 39 : i
}

proto.update = function (hash) {
  this._digest = false
  if(this.pre == null)
    this.pre = hash.substring(0, this.depth)

  var i = intAt(hash, this.depth), t = this.tree[i]
  if('string' == typeof t) {
    this.tree[i] = new Merkle(this.depth + 1, t).update(hash)
  } else if(t)
    this.tree[i].update(hash)
  else
    this.tree[i] = hash

  return this
}

proto.matchesPrefix = function (hash) {
  var d = this.depth
  while(d--)
    if(this.hash[d] !== hash[d])
      return false
  return true
}

proto.digest = function () {
  if(this._digest)
    return this.hash

  var h = crypto.createHash('sha1')

  for(var i = 0; i < 16; i ++) {
    var t = this.tree[i]
    //console.log(this.tree)
    if('string' === typeof t)
      h.update(t, 'hex')
    else if(t)
      h.update(t.digest(), 'hex')
  }

  this._digest = true
  return this.hash = h.digest('hex')
}

proto.prefix = function () {
  return this.pre//this.firstHash.substring(0, this.depth)
}

proto.toJSON = function () {
  return {
    pre: this.prefix(),
    hash: this.digest(),
    tree: this.tree.filter(Boolean).map(function (e) {
      return 'string' === typeof e ? e : e.toJSON()
    })
  }
}

Merkle.tree = function (a) {
  var m = new Merkle(0)
  a.forEach(function (h) {
    m.update(h)
  })
  return m
}

//recreate the array used to create the tree.
proto.leaves = function (a) {
  a = a || []

  this.tree.forEach(function (o) {
    if('string' === typeof o)
      a.push(o)
    else
      o.leaves(a)
  })
  return a
}

//iterate down the tree, and find the branch that matches this tree.
proto.subtree = function (prefix) {

  if(this.depth == prefix.length && prefix == this.pre)
    return this

  var i = intAt(prefix, this.depth)
  if('string' === typeof this.tree[i])
    return this.tree[i]
  if(this.tree[i])
    return this.tree[i].subtree(prefix)

  console.log('nomatch', prefix, this.depth)
  return null
}

proto.top = function () {
  return this.digest()
}

proto.has = function (hash) {
  var i = intAt(hash, this.depth)
  var t = this.tree[i]
  if(!t)
    return false
  if(t === hash)
    return true
  return t.has(hash)
}

function flatten (a) {
  return a.reduce(function (a, b) {
    return a.concat(b)
  }, [])
}

proto.expand = function () {
  var a = {}
  var d = this.depth
  this.tree.forEach(function (hash) {
    if('string' === typeof hash)
      a[hash.substring(0, d + 1)] = hash
    else
      a[hash.pre] = hash.digest()
  })

  return a
}


module.exports = Merkle

if(!module.parent) {
  var table = require('./util').table

  var a = table(4)
  var m = Merkle.tree(a)
  console.log(JSON.stringify(m, null, 2))
}


