var tape = require('tape')
var sets = require('./util')

             //   shared/left/right
tape('stream-set, 0/0/6', sets(0, 6, 6, false, 10))

tape('stream-set, 0/1/1', sets(0, 1, 1, false, 10))
tape('stream-set, 1/0/0', sets(1, 0, 0, false, 10))
tape('stream-set, 10/4/4', sets(10, 4, 4, false, 10))
tape('stream-set, 100/40/0', sets(100, 40, 0, false, 10))
tape('stream-set, 0/40/0', sets(0, 40, 0, false, 10))
tape('stream-set, 0/0/6', sets(0, 0, 6, false, 10))
tape('stream-set, 0/6/6', sets(0, 6, 6, false, 10))
tape('stream-set, 0/7/7', sets(0, 7, 7, false, 10))
tape('stream-set, 0/7/7', sets(0, 8, 8, false, 10))
tape('stream-set, 0/8/8', sets(0, 8, 8, false, 10))
tape('stream-set, 0/50/50', sets(0, 50, 50, false, 10))
tape('stream-set, 100/50/50', sets(100, 50, 50), false, 10)

