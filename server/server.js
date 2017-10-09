//=====================================================================
//=====================================================================
//
//		server.js
//
//=====================================================================
//=====================================================================


process.env['DEBUG'] = 'socket.io* node myapp'; // socket.io logging.

// Includes

var npm_path = require('path');
var npm_fs = require('fs');

var npm_express = require('express');
var npm_http = require('http');
var npm_socketio = require('socket.io');

var npm_string = require('string');

// Settings

var NodeJS_Address = process.env.IP || "0.0.0.0";
var NodeJS_Port = process.env.PORT || 3000;

var DataFolder = npm_path.resolve(__dirname, '../admin/data');
var ClientFolder = npm_path.resolve(__dirname, '../client');
// var ProjectsFolder = npm_path.resolve(__dirname, 'projects');
// var ItemsFolder = npm_path.resolve(__dirname, 'Items');

// Load and Configure the Membership interface.
// var Membership = require('./Membership.js');
var Membership = require('liquicode_membership');
var Membership_SocketIO = require('liquicode_membership/Membership-SocketIO.js');
Membership.RootFolder = npm_path.resolve(__dirname, '../members');
Membership.ApplicationName = 'warframe-caddy';


//=====================================================================
//=====================================================================
//
//		HTTP Server
//
//=====================================================================
//=====================================================================


var ExpressRouter = npm_express();

/*
// Define a static route for serving warframe.market icon files.
ExpressRouter.get('/icons/*',
	function(Request, Response, Next) {
		try {
			var error_artifact_not_found = Error('Icon not found.');

			// Get the artifact location.
			var item_folder = lib_ItemsDB.RootFolder;
			var item_filename = npm_path.join(item_folder, Request.url);

			// Load the artifact.
			if (!npm_fs.existsSync(item_filename)) {
				throw error_artifact_not_found;
			}

			// Send the artifact.
			var options = {
				root: '',
				dotfiles: 'deny',
				headers: {
					'x-timestamp': Date.now(),
					'x-sent': true
				}
			};
			Response.sendFile(item_filename, options,
				function(sendFile_error) {
					if (sendFile_error) {
						console.log(sendFile_error);
						Response.status(sendFile_error.status).end();
					}
					else {
						console.log('Sent artifact:', item_filename);
					}
				});
			return;
		}
		catch (catch_error) {
			Response.send('[FILE ERROR] ' + catch_error.message);
		}
		Next();
	});
*/


// Define a static route for serving the client application files.
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


// var npm_async = require('async');
var SocketIo = npm_socketio.listen(HttpServer);

var HttpSockets = [];


//=====================================================================
//	Initialize a socket connection.
SocketIo.on('connection',
	function(Socket) {

		// ==========================================
		// Register this socket connection.
		HttpSockets.push(Socket);

		// ==========================================
		// Socket disconnection.
		Socket.on('disconnect',
			function() {
				HttpSockets.splice(HttpSockets.indexOf(Socket), 1);
			});

		// ==========================================
		// Membership functions.
		Membership_SocketIO.WireSocketEvents(Membership, Socket, null);

		//=====================================================================
		//	List Items
		//=====================================================================

		Socket.on('list_items_request',
			function(ItemType, IndexOnly) {
				var response = {};
				try {

					var items = [];
					var selected_items = [];

					if (IndexOnly) {
						var filename = npm_path.join(DataFolder, 'all-items-index.json');
						items = JSON.parse(npm_fs.readFileSync(filename));
					}
					else {
						var filename = npm_path.join(DataFolder, 'all-items-data.json');
						items = JSON.parse(npm_fs.readFileSync(filename));
					}

					if (ItemType) {
						items.forEach(item => {
							if (item.item_type == ItemType) {
								selected_items.push(item);
							}
						});
					}
					else {
						selected_items = items;
					}

					response.item_type = ItemType;
					response.data = selected_items;
					Socket.emit('list_items_response', response);
				}
				catch (err) {
					console.error('Error in [list_items_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		const worldstate_parser = require('warframe-worldstate-parser');

		Socket.on('get_worldstate_request',
			function() {
				try {

					var options = {
						host: 'content.warframe.com',
						path: '/dynamic/worldState.php'
					};

					npm_http.get(options).on('response',
						function(response) {
							var worldstate = '';
							var i = 0;
							response.on('data',
								function(chunk) {
									i++;
									worldstate += chunk;
								});
							response.on('end',
								function() {
									var worldstate_data = JSON.parse(worldstate);
									var worldstate_object = new worldstate_parser(worldstate);
									Socket.emit('get_worldstate_response', worldstate_object);
								});
						});

				}
				catch (err) {
					console.error('Error in [get_worldstate_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


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
