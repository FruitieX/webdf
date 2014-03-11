#!/usr/bin/env node

// serve a nice webpage on port 8080
var WWW_PORT = 8080;
var IO_PORT = 8081;

var static = require('node-static');
var io = require('socket.io').listen(IO_PORT);

var file = new static.Server('./');

require('http').createServer(function(req, res) {
	req.addListener('end', function () {
		file.serve(req, res);
	}).resume();
}).listen(WWW_PORT);
console.log('web server listening on port ' + WWW_PORT);

process.on('uncaughtException', function (err) {
	console.error(err.stack);
	console.log("ERROR! Node not exiting.");
});

io.sockets.on('connection', function(socket) {
	socket.on('pos', function(data) {
		console.log('pos update: ' + data);
	});
});
console.log('socket.io listening on port ' + IO_PORT);
