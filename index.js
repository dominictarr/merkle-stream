var crypto = require('crypto')

function Merkle (depth) {
  this.hash = null //hash
  this.tree = []
  this.pre = null
  this.length = 0
  this.depth = depth || 0
  this._digest = false
  this.leaf = false
  //this.target = null
  this.sync = false
  //this._onSync = null
}


Merkle.tree = function (a) {
  var m = new Merkle(0)
  a.forEach(function (h) {
    m.update(h)
  })
  return m
}

var proto = Merkle.prototype

function intAt(hash, depth) {

  //parse 'a' as 10
  var i = hash.charCodeAt(depth) - 87

  //but if it was a number, make it count from 0
  return (i < 0) ? i + 39 : i
}

proto.update = function (hash) {

  if(0 === this.length) {
    this.leaf = true
    this._digest = true
    this.pre = hash.substring(0, this.depth)
    this.hash = hash 
    this.length = 1

//    if(this.target && this.target == this.digest()) {
//      this.target = null
//      this.sync = true
//      this._onSync(this.pre, this.digest())
//    }

    return this
  }
  var _hash = this.hash

  if(this.leaf) {
    if(hash === this.hash)
      return this
    this.tree[intAt(_hash, this.depth)] = new Merkle(this.depth + 1).update(_hash)
    this.leaf = false
  }

  this._digest = false
  this.hash = null

  var i = intAt(hash, this.depth)
  var t = this.tree[i]
 
  if(!t) {
    this.tree[i] = new Merkle(this.depth + 1).update(hash)
    this.length ++
  } else {
    this.tree[i].update(hash)
  }

//  if(this.target && this.target == this.digest()) {
//    this.target = null
//    this.sync = true
//    this._onSync(this.pre, this.digest())
//  }

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
    if(t) h.update(t.digest(), 'hex')
  }

  this._digest = true
  return this.hash = h.digest('hex')
}

proto.prefix = function () {
  return this.pre
  //this.firstHash.substring(0, this.depth)
}

proto.toJSON = function () {
  if(this.leaf)
    return this.hash
  return {
    pre: this.prefix(),
    hash: this.digest(),
    tree: this.tree.filter(Boolean).map(function (e) {
      return 'string' === typeof e ? e : e.toJSON()
    })
  }
}

//recreate the array used to create the tree.
proto.leaves = function (a) {
  a = a || []
  if(this.leaf)
    return [this.hash]
  this.tree.forEach(function (o) {
    if(o.leaf) a.push(o.hash)
    else       o.leaves(a)
  })
  return a
}

//iterate down the tree, and find the branch that matches this tree.
proto.subtree = function (prefix) {
  if(this.depth == prefix.length && prefix == this.pre)
    return this

  var i = intAt(prefix, this.depth)
  if(this.tree[i])
    return this.tree[i].subtree(prefix)

  return null
}

proto.has = function (hash) {
  if(this.leaf)
    return this.digest() === hash
  var i = this._at(hash)
  var t = this.tree[i]
  if(!t)
    return false
  return t.has(hash)
}

proto._at = function (hash) {
  var i = hash.charCodeAt(this.depth) - 87

  //but if it was a number, make it count from 0
  return (i < 0) ? i + 39 : i
}

proto.get = function (hash) {
  if(this.leaf)
    return this.digest() === hash ? this : null
  var i = this._at(hash), t = this.tree[i]
  if(!t)
    return null
  return t.get(hash)
}

proto.expand = function () {
  var a = {}
  var d = this.depth
  this.tree.forEach(function (hash) {
    if(hash.leaf)
      a[hash.pre] = hash.digest()
    else
      a[hash.pre] = {hash: hash.digest()/*, depth: ? */}
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
