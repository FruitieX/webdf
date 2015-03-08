#!/usr/bin/env node

// serve a nice webpage on port 8080
var WWW_PORT = 8082;
var IO_PORT = 8081;

var static = require('node-static');
var io = require('socket.io').listen(IO_PORT, {log: false});
var inspect = require('util').inspect;

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

//Listen for client emits and broadcast the information to other clients
io.sockets.on('connection', function(socket) {
	console.log('Client connected');
	//player location
	socket.on('update', function(data) {
		data.uid = socket.id;
		socket.broadcast.emit('update', data);
	});
	//player score
	socket.on('score', function(data) {
		data.uid = socket.id;
		socket.broadcast.emit('score', data);
	});
	//player shoot
	socket.on('shoot', function(data) {
		socket.broadcast.emit('shoot', data);
	});
	//client determines wether or not a shot was a hit, and emits accordingly
	socket.on('hit', function(data) {
		io.sockets.socket(data.uid).emit('hit', data.name);
	});
	// sound emitted at position origin
	socket.on('sound', function(data) {
		socket.broadcast.emit('sound', data);
	});
    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    });
	//client disconnects
	socket.on('disconnect', function(data) {
		socket.broadcast.emit('p_disconnected', socket.id);
		console.log('Client disconnected');
	});
});
console.log('socket.io listening on port ' + IO_PORT);
