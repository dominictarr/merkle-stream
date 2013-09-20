
var crypto = require('crypto')

function Merkle (depth) {
  this.hash = null
  this.firstHash = null
  this.last = null
  this.tree = new Array(16)
  this.depth = depth
}

var proto = Merkle.prototype

proto.update = function (hash) {
  if(!this.firstHash) {
    this.hash = this.firstHash = hash
  } else {
    if(!this.last) {
      this.tree.push(this.last = new Merkle(this.depth + 1).update(this.hash))
    }

    //this.tree[this.tree.length - 1]
    //decide whether this hash is a child or a grandchild

    //if this did a binary search,
    //then it could be used insertion style.

    if(this.last.prefix(hash)) {
      this.last.update(hash)
    } else {
      this.tree.push(new Merkle(this.depth + 1).update(hash))
    }
  }
  return this
}

proto.prefix = function (hash) {
  var d = this.depth
  while(d--)
    if(this.hash[d] !== hash[d])
      return false
  return true
}

proto.digest = function () {
  var l = this.tree.length
  if(!l)
    return this.firstHash

  var h = crypto.createHash('sha1')

  for(var i = 0; i < l; i ++)
    h.update(this.tree[i].digest(), 'hex')

  return this.hash = h.digest('hex')
}

proto.toJSON = function () {

  if(!this.tree.length)
    return this.hash

  return {
    hash: this.hash,
    tree: this.tree.map(function (e) {
      return e.toJSON()
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
  if(!this.tree.length) {
    if(this.hash) a.push(this.hash)
    return a
  }
  trees.forEach(function (o) {
    o.leaves(a)
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

