var crypto = require('crypto')

//given a sorted array of hashes
//construct an optimally shallow hash tree.

module.exports = function prefixes (array, depth) {
  depth = depth || 1
  if(array.length === 1) {
    return array[0]
  }

//  var prefix = array[0].substring(0, depth)

  var o = {}
  for(var i in array) {
    var v = array[i]
    var p = v.substring(0, depth)
    if(o[p])
      o[p].push(v)
    else
      o[p] = [v]
  }
  var h = crypto.createHash('sha1')
  var b = []
  for(var k in o) {
    var c
    b.push(c = prefixes(o[k], depth + 1))
    h.update(c.hash || c, 'hex')
  }

  return {
    pre: array[0].substring(0, depth - 1),
    hash: h.digest('hex'), tree: b
  }
}

