#!/usr/bin/env node

var connect = require("connect");

var port = 8080

var app = connect.createServer().use(connect.static(__dirname + '/public'));
app.listen(port);
console.log("Listening on http://localhost:%s/", port);