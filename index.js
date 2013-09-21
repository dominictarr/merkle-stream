
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

  if(false) {
    this.tree.forEach(function (t) {
      if('string' === typeof t)
        h.update(t, 'hex')
      else if(t != null)
        h.update(t.digest(), 'hex')
    })
  } else {
    for(var i = 0; i < 16; i ++) {
      var t = this.tree[i]
      //console.log(this.tree)
      if('string' === typeof t)
        h.update(t, 'hex')
      else if(t)
        h.update(t.digest(), 'hex')
    }
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
/*  if(!this.last) {
    a.push(this.hash)
    return a
  }*/

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

  if(this.matchesPrefix(prefix) && this.depth == prefix.length)
    return this
  var i = intAt(prefix, this.depth)
  if(this.tree[i])
    return this.tree[i].subtree(prefix)
  else {
    console.log('nomatch', prefix, this.depth)
    return null
  }
}

proto.top = function () {
  return ['', this.digest()]
}

proto.diff = function (pair) {
  var prefix = pair[0]
  var hash = pair[1]
  if(hash === this.digest())
    return []
  var self = this
  var tree = this.subtree(prefix)
  var a = []
  console.log(this.tree)
  this.tree.forEach(function (e) {
    if('string' == typeof e)
      return [e.substring(0, self.depth + 1), e]    
    return a.push([e.prefix(), e.digest()])
  })
  return a
}

Merkle.diff2 = function (a, b) {
  var check = [a.top()]
  var _check = []
  check.forEach(function (e) {
    _check = _check.concat(proto.diff(e))
  }) 
}

module.exports = Merkle

if(!module.parent) {
  var table = require('./util').table

  var a = table(4)
  var m = Merkle.tree(a)
  console.log(JSON.stringify(m, null, 2))
}


