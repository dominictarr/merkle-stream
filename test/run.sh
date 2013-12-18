#! /usr/bin/env bash

node scale.js > scale.csv
line-graph < scale.csv > scale.png --title "Time to Construct Merkle Tree" --width 1000 --height 600
