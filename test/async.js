var tape = require('tape')
var sets = require('./util')

             //   shared/left/right
tape('stream-set, 0/0/6', sets(0, 6, 6, false, 10))

