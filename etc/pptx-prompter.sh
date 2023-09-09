#!/bin/sh
node \
   dst/server/index.js -v2 \
   -a 0.0.0.0 -p 12346 \
   -d smp
