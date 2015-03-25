#!/usr/bin/env bash

HOST="kjetilvalle.com"

./generate.js
rsync -avz --delete -e ssh public/ "kjetil@${HOST}:/var/www/blog/"
