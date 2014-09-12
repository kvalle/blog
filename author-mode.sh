#!/bin/bash

cd public
python -m SimpleHTTPServer 4321 &
trap "kill $!" SIGINT SIGTERM
cd ..

./generate.js
while inotifywait -q -r -e modify .; do
    ./generate.js
done