/* global Membership */

"use strict";

var npm_path = require('path');
var npm_fs_extra = require('fs-extra');
var npm_http = require('http');


//---------------------------------------------------------------------
function AppServer(Membership) {
	Membership.RootFolder = npm_path.resolve(__dirname, '../members');
	Membership.ApplicationName = 'Warframe-Caddy';
	return AppServer;
}


//---------------------------------------------------------------------
var ERR_AppServerError = new Error("Application Server Error.");


//---------------------------------------------------------------------
AppServer.OnConnection =
	function OnConnection(Membership, Socket, Logger) {

		var DataFolder = npm_path.resolve(__dirname, '../admin/data');

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
						items = npm_fs_extra.readJsonSync(filename);
					}
					else {
						var filename = npm_path.join(DataFolder, 'all-items-data.json');
						items = npm_fs_extra.readJsonSync(filename);
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

		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['AppServer'] = AppServer;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = AppServer;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = AppServer;
	}
}
