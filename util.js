//DELETE THIS FILE.
//

//generate an array of ordered hashes.

var crypto = require('crypto')
function hash(x, enc) {
  if('number' === typeof x) {
    x = x.toString(16)
    x = '' + (x.length % 2 ? '0' + x : x)
  }
  return crypto.createHash('sha1').update(x, 'hex').digest('hex')
}
exports.hash = hash
exports.table = table

function table (bits, enc) {
  var max = 1 << bits
  var a = []
  for(var i = 0; i < max; i++) {
    var x = i.toString(16)
    if(x.length % 2)
      x = '0' + ''+x
    a.push(hash(x, enc))
  }
  return a.sort()
}


