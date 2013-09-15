
var _hash = require('shasum')
var pull = require('pull-stream')
var window = require('pull-window')
var crypto = require('crypto')
var hashes = 0
var BUFFER = false
function hash (x) {
  hashes ++
  if(BUFFER) {
    var h = crypto.createHash('sha1')
    x.forEach(function (e) {
      h.update(e)
    })
    return h.digest()
  } else {
    if(x.length % 2)
      x = '0' + ''+x
    return crypto.createHash('sha1').update(x, 'hex').digest('hex')
  }
}

function ordered(n, _hash) {
  return pull(
    pull.count(n || 256),
    pull.map(function (n) {
      return BUFFER ? [n.toString(16)] : n.toString(16)
    }),
    pull.map(_hash || hash),
    pull.collect(),
    pull.map(function (s) {
      s.sort()
      START = Date.now()
      return s
    }),
    pull.flatten()
  )
}

function key(data, depth) {
  if(BUFFER) {
    if(!Buffer.isBuffer(data))
      return data.pre.substring(0, data.pre.length - 1)
    else
      return data.toString('hex', 0, depth/2)
  }
  else
    if('object' === typeof data)
      return data.pre.substring(0, data.pre.length - 1)
    else
      return data.substring(0, depth)

}

function value(data) {
  if(BUFFER) {
    return !Buffer.isBuffer(data) ? data.hash : data
  }
  else
    return 'object' === typeof data ? data.hash : data
}

function tree(depth) {
  var cur, seen = BUFFER ? [] : '', tree = []
  return window(function (data, cb) {
    var pre = key(data, depth) //.substring(0, depth)
    if(cur == null) cur = pre
    else if(pre <= cur) return
    var _cur = cur
    var n = 0
    return function (end, data) {
      var pre
      n++
      if(!end && (pre = key(data, depth)) <= cur) {
        if(BUFFER)
          seen.push(value(data))
        else
          seen += value(data)
        tree.push(data)
      } else {
        var h = hash(seen)

        if(tree.length) {
          var _tree = tree.reduce(function (tree, item) {
            if(item.pre)
              tree[item.pre] = {pre: item.pre, hash: item.hash, tree: item.tree}
            else
              tree[cur] = item
            return tree
          }, {})
      
          cb(null, {pre:cur, hash:h, tree: _tree, count: n})

        }
        cb(null, {pre: cur, hash: hash})

        cur = pre; seen = BUFFER ? [] : ''; tree = []
      }
    }
  }, function (_, data) { return data })
}

function bigTree (n) {
  var trees = []
  while(n--)
    trees.push(tree(n))
  return pull.apply(null, trees)
}

pull(ordered(1<<16, hash), bigTree(4), pull.drain(function (tree) {
  console.log(JSON.stringify(tree, null, 2))
}, function () {
  console.log('time', Date.now() - START)
  console.log('hashes=', hashes)
}))


//[{pre: $pre, sum: hash, tree: [...]},...]
