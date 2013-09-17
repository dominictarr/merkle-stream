var crypto = require('crypto')

//given a sorted array of hashes
//construct an optimally shallow hash tree.

module.exports = function prefixes (array, depth) {
  depth = depth || 0
  if(array.length === 1) {
    return array[0]
  }

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
  for(var k in o) {
    o[k] = prefixes(o[k], depth + 1)
    h.update(o[k].hash || o[k], 'hex')
  }

  return {
    hash: h.digest('hex'), tree: o
  }
}

