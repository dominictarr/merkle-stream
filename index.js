
var crypto = require('crypto')

function Merkle (depth) {
  this.hash = null
  this.firstHash = null
  this.last = null
  this.tree = []
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
  if(!this.firstHash) {
    this.hash = this.firstHash = hash
  } else {

    if(!this.last) {   
      this.tree[intAt(this.hash, this.depth)] = this.last =
        new Merkle(this.depth + 1).update(this.hash)
    }

// this faster when hashes are in order,
// but can only do in order.
//    if(this.last.prefix(hash)) {
//      this.last.update(hash)
//      return this
//    }

    var i = intAt(hash, this.depth)
    if(this.tree[i])
      this.tree[i].update(hash)
    else
      this.last = this.tree[i] = new Merkle(this.depth + 1).update(hash)

//
//    if(this.last.prefix(hash)) {
//      this.last.update(hash)
//    } else {
//      this.tree.push(new Merkle(this.depth + 1).update(hash))
//    }
 
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
  if(!this.last || this._digest)
    return this.hash

  var h = crypto.createHash('sha1')

  for(var i = 0; i < 16; i ++) {
    if(this.tree[i])
      h.update(this.tree[i].digest(), 'hex')
  }
  this._digest = true
  return this.hash = h.digest('hex')
}

proto.toJSON = function () {

  if(!this.last)
    return this.hash

  return {
    pre: this.firstHash.substring(0, this.depth),
    hash: this.digest(),
    tree: this.tree.filter(Boolean).map(function (e) {
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
  if(!this.last) {
//    console.log('!LAST', this.hash)
    a.push(this.hash)
    return a
  }
  this.tree.forEach(function (o) {
//    console.log(o)
  //  console.log(o.hash)
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

