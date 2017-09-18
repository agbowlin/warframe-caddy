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

var ClientFolder = npm_path.resolve(__dirname, '../client');
// var ProjectsFolder = npm_path.resolve(__dirname, 'projects');
// var ItemsFolder = npm_path.resolve(__dirname, 'Items');

// Load and Configure the Membership interface.
var lib_Membership = require('./lib_Membership.js');
lib_Membership.RootFolder = npm_path.resolve(__dirname, '../members');

// Load and Configure the Item Database interface.
// var lib_ItemsDB = require('./lib_ItemsDB.js');
// lib_ItemsDB.RootFolder = npm_path.resolve(__dirname, '../items');


// Command Line

if (process.argv.length > 2) {
	NodeJS_Port = process.argv[2];
}


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


		//=====================================================================
		//	Member Signup
		//=====================================================================

		Socket.on('member_signup_request',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					var member_data = lib_Membership.NewMember(MemberName, MemberEmail, MemberPassword);
					Socket.emit('member_signup_response', member_data);
				}
				catch (err) {
					console.error('Error in [member_signup_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Login
		//=====================================================================

		Socket.on('member_login_request',
			function(MemberName, MemberEmail, MemberPassword) {
				try {
					var member_data = lib_Membership.GetMemberData(MemberName);
					Socket.emit('member_login_response', member_data);
				}
				catch (err) {
					console.error('Error in [member_login_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	Member Data
		//=====================================================================

		Socket.on('member_data_request',
			function(MemberName) {
				try {
					var member_data = lib_Membership.GetMemberData(MemberName);
					Socket.emit('member_data_response', member_data);
				}
				catch (err) {
					console.error('Error in [member_data_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('get_member_data_request',
			function(MemberName) {
				try {
					var member_data = lib_Membership.GetMemberData(MemberName);
					Socket.emit('get_member_data_response', member_data);
				}
				catch (err) {
					console.error('Error in [get_member_data_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});

		Socket.on('put_member_data_request',
			function(MemberData) {
				try {
					var success = lib_Membership.PutMemberData(MemberData);
					Socket.emit('update_member_data_response', success);
				}
				catch (err) {
					console.error('Error in [member_data_request]: ', err);
					Socket.emit('server_error', '[SERVER ERROR] ' + err.message);
				}
			});


		//=====================================================================
		//	List Items
		//=====================================================================

		Socket.on('list_items_request',
			function(ItemType) {
				var response = {};
				try {
					response.item_type = ItemType;
					ItemType = ItemType.toLowerCase();
					var file_content = '';
					if (ItemType == 'warframe') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/warframes.json');
					}
					else if (ItemType == 'primary weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-primary.json');
					}
					else if (ItemType == 'secondary weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-secondary.json');
					}
					else if (ItemType == 'melee weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-melee.json');
					}
					else if (ItemType == 'archwing primary weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-archwing-primary.json');
					}
					else if (ItemType == 'archwing melee weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-archwing-melee.json');
					}
					else if (ItemType == 'sentinel weapon') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/weapons-sentinel.json');
					}
					else if (ItemType == 'void relic') {
						file_content = npm_fs.readFileSync('../admin/warframe.wikia.data/void-relics.json');
					}
					else if (ItemType == 'gear part') {
						file_content = npm_fs.readFileSync('../admin/tennodrops.data/parts.json');
					}
					else if (ItemType == 'mod') {
						file_content = npm_fs.readFileSync('../admin/tennodrops.data/mods.json');
					}

					response.data = JSON.parse(file_content);
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


//==========================================
// Begin accepting connections.
HttpServer.listen(
	NodeJS_Port, NodeJS_Address,
	function() {
		var addr = HttpServer.address();
		console.log("Server listening at", addr.address + ":" + addr.port);
		console.log('Access application here: ' + addr.address + ":" + addr.port + '/index.html');
	});
