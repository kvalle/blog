#!/usr/bin/env bash

./generate.js
rsync -avz --delete -e ssh public/ kjetil@kjetilvalle.com:/home/kjetil/web/blog/