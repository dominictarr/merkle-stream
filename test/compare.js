var tape = require('tape')
var sets = require('./util')

             //   shared/left/right
tape('stream-set, 0/1/1', sets(0, 1, 1))
tape('stream-set, 10/4/4', sets(10, 4, 4))
tape('stream-set, 0/0/1', sets(0, 0, 1))
tape('stream-set, 1/0/0', sets(1, 0, 0))
tape('stream-set, 100/40/0', sets(100, 40, 0))
tape('stream-set, 0/40/0', sets(0, 40, 0))
tape('stream-set, 0/0/6', sets(0, 6, 6, false, 10))
tape('stream-set, 0/6/6', sets(0, 6, 6))
tape('stream-set, 0/7/7', sets(0, 7, 7))
tape('stream-set, 0/7/7', sets(0, 8, 8))
tape('stream-set, 0/8/8', sets(0, 8, 8))
tape('stream-set, 0/50/50', sets(0, 50, 50))

//tape('stream-set, 100/5011/5020', sets(100, 5011, 5020))
//tape('stream-set, 1000/11/5020', sets(1000, 11, 5020))
//tape('stream-set, 1000/11/5020', sets(1000, 1, 1))
//tape('stream-set, 1000/1000/1000', sets(1000, 1000, 1000))
//tape('stream-set, 1000/100/100', sets(10000, 100, 100))
//tape('stream-set, 1000/100/10', sets(10000, 100, 0))

tape('stream-set, 1000/11/5020', sets(10000, 14, 0))


