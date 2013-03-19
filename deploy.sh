#!/usr/bin/env bash

./generate.js
rsync -avz -e ssh public/ kjetil@kjetilvalle.com:/home/kjetil/web/blog/
