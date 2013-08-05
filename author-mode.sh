#!/bin/bash

cd public
python -m SimpleHTTPServer &
trap "kill $!" SIGINT SIGTERM
cd ..

while inotifywait -q -r -e modify .; do
    ./generate.js
done