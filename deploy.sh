#!/usr/bin/env bash

./generate.js
s3cmd --delete-removed --config=./.s3cfg sync public/ s3://kjetilvalle.com
