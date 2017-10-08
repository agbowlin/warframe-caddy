/* global $ */
/* global io */
/* global angular */
/* global MembershipClient */


var module = angular.module('MyWarframeApp', ['ngCookies']);


module.controller('GearController',
	function GearController($scope, $cookies) {
		var socket = io.connect();


		//==========================================
		//	Socket.IO Messages
		//==========================================


		//==========================================
		socket.on('connect', function() {
			$scope.notice = "... connected";
			$scope.$apply();
		});


		//==========================================
		socket.on('server_error', function(server_error) {
			console.log('> server_error', server_error);
			$scope.errors.push(server_error);
			$scope.$apply();
			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		Membership
		//
		//=====================================================================
		//=====================================================================


		$scope.Member = MembershipClient.GetMember('warframe-caddy', socket, $cookies);


		//==========================================
		$scope.Member.OnGetMemberData = function(Success) {
			if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnPutMemberData = function(Success) {
			if (!Success) { return; }
			$scope.$apply();
			return;
		};


		//==========================================
		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in && !$scope.Member.member_data) {
			// $scope.Member.GetMemberData();
			$scope.Member.MemberReconnect();
		}


		//=====================================================================
		//=====================================================================
		//
		//		Item List
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.list_items_request = function list_items_request(ItemType) {
			$scope.notice = "Listing " + ItemType + ".";
			$scope.errors = [];
			socket.emit('list_items_request', ItemType);
			return;
		};


		//==========================================
		socket.on('list_items_response', function(Response) {
			$scope.notice = "Listed [" + Response.data.length + "] items.";

			$scope.all_items_list = [];
			$scope.parts_list = [];
			Response.data.forEach(function(item) {
				$scope.all_items_list[item.name] = item; // Store all items in an associative array.
				if (item.item_type == 'Gear Part') {
					$scope.parts_list.push(item); // AngularJS/DataTables barfs if you give it an associative array.
				}
			});
			$scope.update_total_ducat_value();
			// generate_table('parts_list_parent', table_definition, $scope.parts_list);
			$scope.$apply();
			$('#parts_list').DataTable({
				"paging": false,
				"ordering": false,
				"info": false
			});
			// $scope.$apply();
			return;
		});


		//==========================================
		$scope.update_total_ducat_value = function update_total_ducat_value(ItemName) {
			$scope.total_ducat_value = 0;
			for (var index = 0; index < $scope.parts_list.length; index++) {
				var part = $scope.parts_list[index];
				if (part.value_ducats) {
					var user_data = $scope.Member.member_data.items[part.name];
					if (user_data) {
						if (user_data.item_owned) {
							$scope.total_ducat_value = $scope.total_ducat_value + (user_data.item_owned * part.value_ducats);
						}
					}
				}
			}
		};


		//=====================================================================
		//=====================================================================
		//
		//		Item Data
		//
		//=====================================================================
		//=====================================================================


		var table_definition = {
			table_id: 'parts_list',
			table_class: 'item-list-table',
			table_attributes: 'width="100%"',
			columns: [{
					title: 'Owned',
					type: 'number',
					model: '$scope.Member.member_data.items[#.name].item_owned'
				},
				{
					title: 'Name',
					type: 'text',
					model: '#.name'
				},
				{
					title: 'Tax (c)',
					type: 'number',
					model: '#.trade_tax'
				},
				{
					title: 'Ducats (d)',
					type: 'number',
					model: '#.value_ducats'
				}
			]
		};


		//==========================================
		function generate_table(ParentElement, TableDefinition, TableData) {
			var html = '';

			// Build the table element.
			html += '<table';
			if (TableDefinition.table_id) { html += ' id="' + TableDefinition.table_id + '"'; }
			if (TableDefinition.table_class) { html += ' class="' + TableDefinition.table_class + '"'; }
			if (TableDefinition.table_attributes) { html += ' ' + TableDefinition.table_attributes; }
			html += '>';

			// Build the column headers.
			html += '<tr>';
			TableDefinition.columns.forEach(
				function(column) {
					html += '<th>' + column.title + '</th>';
				}
			);
			html += '</tr>';

			// Build the data rows.
			for (var data_index = 0; data_index < TableData.length; data_index++) {
				html += '<tr>';
				var data = TableData[data_index];
				for (var column_index = 0; column_index < TableDefinition.columns.length; column_index++) {
					var column = TableDefinition.columns[column_index];

					// Build a data cell.
					html += '<td>';
					var expr = column.model.replace('#', 'data');
					var value = '';
					try {
						value = eval(expr);
					}
					catch (e) {}
					if (value == undefined) {
						value = '';
					}
					if (column.type == 'text') {
						value = '' + value;
					}
					else if (column.type == 'number') {
						value = value.toLocaleString();
					}
					html += value;
					html += '</td>';

				}
				html += '</tr>';
			}

			// End the table.
			html += '</table>';

			// Inject the table html.
			document.getElementById(ParentElement).innerHTML = html;
			return;
		}


		//==========================================
		$scope.get_ensure_item = function get_ensure_item(ItemName) {
			var item = $scope.Member.member_data.items[ItemName];
			if (!item) {
				item = {
					item_level: 0,
					item_owned: 0
				};
				$scope.Member.member_data.items[ItemName] = item;
			}
			return item;
		};


		//==========================================
		$scope.change_item_owned_count = function change_item_owned_count(ItemName, Amount) {
			var item = $scope.get_ensure_item(ItemName);
			var n = parseInt(item.item_owned, 10);
			n = n + Amount;
			if (n < 0) { n = 0; }
			item.item_owned = n;
			$scope.update_total_ducat_value();
			// $scope.$apply();
			return;
		};


		//==========================================
		$scope.change_item_owned_level = function change_item_owned_level(ItemName, Amount) {
			var item = $scope.get_ensure_item(ItemName);
			var n = parseInt(item.item_level, 10);
			n = n + Amount;
			if (n < 0) { n = 0; }
			item.item_level = n;
			return;
		};


		//=====================================================================
		//=====================================================================
		//
		//		App Startup
		//
		//=====================================================================
		//=====================================================================

		$scope.notice = "";
		$scope.errors = [];

		$scope.all_items_list = null;
		$scope.parts_list = null;
		$scope.total_ducat_value = 0;

		// Initialize the item list.
		$scope.list_items_request('');

	});
