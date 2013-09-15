
var _hash = require('shasum')
var pull = require('pull-stream')
var window = require('pull-window')
var crypto = require('crypto')
var hashes = 0
function hash (x) {
  hashes ++
  var h = crypto.createHash('sha1')
  x.forEach(function (e) {
    h.update(e)
  })
  return h.digest()
//  return _hash(x)
}

function ordered(n, _hash) {
  return pull(
    pull.count(n || 256),
    pull.map(function (n) {
      return [''+n]
    }),
    pull.map(_hash || hash),
    pull.collect(),
    pull.map(function (s) {
      START = Date.now()
      return s.sort()
    }),
    pull.flatten()
  )
}

function key(data, depth) {
  if(!Buffer.isBuffer(data))
    return data.pre.substring(0, data.pre.length - 1)
  else
    return data.toString('hex', 0, depth/2)
}

function value(data) {
  return !Buffer.isBuffer(data) ? data.hash : data
}

function tree(depth) {
  var cur, seen = [], tree = []
  return window(function (data, cb) {
    var pre = key(data, depth) //.substring(0, depth)
    if(cur == null) cur = pre
    else if(pre <= cur) return
    var n = 0
    return function (end, data) {
      var pre
      n++
      if(!end && (pre = key(data, depth)) <= cur) {
        seen.push(value(data))
        tree.push(data)
      } else {
        var h = hash(seen)

        var _tree = tree.reduce(function (tree, item) {
          tree[item.pre] = {hash: item.hash, tree: item.tree}
          return tree
        }, {})

        cb(null, {pre:cur, hash:h, tree: _tree})

        cur = pre; seen = []; tree = []
      }
    }
  }, function (_, data) { return data })
}


pull(ordered(1<<16), tree(2), tree(2), tree(2), pull.drain(console.log, function () {
  console.log('time', Date.now() - START)
  console.log('hashes=', hashes)
}))


//[{pre: $pre, sum: hash, tree: [...]},...]
