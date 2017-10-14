//=====================================================================
//=====================================================================
/*
	server.js

	A simple example of how to use the liquicode_membership module.
	
	Run with: nodejs server.js {port}
*/
//=====================================================================
//=====================================================================

"use strict";

// Enable socket.io logging.
// process.env['DEBUG'] = 'socket.io* node myapp';

// Standard Includes
var npm_path = require('path');
// var npm_fs = require('fs');
var npm_http = require('http');

// 3rd Party Includes
var npm_express = require('express');
var npm_socketio = require('socket.io');

// Include the membership module.
var Membership = require('liquicode_membership');
var Membership_SocketIO = require('liquicode_membership/Membership-SocketIO.js');
// var Membership = require('../../../Membership.js');
// var Membership_SocketIO = require('../../../Membership-SocketIO.js');
Membership.RootFolder = npm_path.resolve(__dirname, '../members');
Membership.ApplicationName = 'Application';

var AppServer = require('./app-server.js')(Membership);


//=====================================================================
//=====================================================================
//
//		HTTP Server
//
//=====================================================================
//=====================================================================


// Create an Express router.
var ExpressRouter = npm_express();

// Define a static route for serving the client application files.
var ClientFolder = npm_path.resolve(__dirname, '../client');
ExpressRouter.use(npm_express.static(ClientFolder));

// Create the HTTP server.
var HttpServer = npm_http.createServer(ExpressRouter);


//=====================================================================
//=====================================================================
//
//		Socket.IO Connections
//
//=====================================================================
//=====================================================================


// Socket.IO uses HttpServer as a transport.
var SocketIo = npm_socketio.listen(HttpServer);

// Maintain a list of connected sockets.
var HttpSockets = [];


//=====================================================================
//	Initialize a socket connection.
SocketIo.on('connection',
	function(Socket) {

		// Register this socket connection.
		HttpSockets.push(Socket);

		// Socket disconnection.
		Socket.on('disconnect',
			function() {
				HttpSockets.splice(HttpSockets.indexOf(Socket), 1);
			});

		// Add the membership functions.
		Membership_SocketIO.WireSocketEvents(Membership, Socket, null);

		AppServer.OnConnection(Membership, Socket, null);

	});


//=====================================================================
//	Broadcast a message to all connected sockets.
function broadcast(event, data) {
	HttpSockets.forEach(
		function(socket) {
			socket.emit(event, data);
		});
}


//=====================================================================
//=====================================================================
//
//		Run Http Server
//
//=====================================================================
//=====================================================================


// NodeJS startup settings.
var NodeJS_Address = process.env.IP || "0.0.0.0";
var NodeJS_Port = process.env.PORT || 3000;

// Check override settings from command line parameters.
if (process.argv.length > 2) {
	NodeJS_Port = process.argv[2];
}


//==========================================
// Begin accepting connections.
HttpServer.listen(
	NodeJS_Port, NodeJS_Address,
	function() {
		var addr = HttpServer.address();
		console.log("Server listening at", addr.address + ":" + addr.port);
		console.log('Access application here: ' + addr.address + ":" + addr.port + '/index.html');
	});
