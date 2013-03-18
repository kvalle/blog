#!/usr/bin/env bash

rsync -avz -e ssh public/ kjetil@kjetilvalle.com:/home/kjetil/web/blog/
