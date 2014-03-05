#!/usr/bin/env node

// serve a nice webpage on port 8000
var PORT = 8080;
var static = require('node-static');

var file = new static.Server('./');

require('http').createServer(function(req, res) {
	req.addListener('end', function () {
		file.serve(req, res);
	}).resume();
}).listen(PORT);
console.log('listening on port ' + PORT);

process.on('uncaughtException', function (err) {
	console.error(err.stack);
	console.log("ERROR! Node not exiting.");
});
