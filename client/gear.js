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
		$scope.list_items_request = function list_items_request(ItemType, IndexOnly) {
			$scope.notice = "Listing " + ItemType + ".";
			$scope.errors = [];
			// $scope.item_list = [];
			socket.emit('list_items_request', ItemType, IndexOnly);
			return;
		};


		//==========================================
		socket.on('list_items_response', function(Response) {
			$scope.notice = "Listed [" + Response.data.length + "] items.";

			$scope.all_gear_list = [];
			$scope.warframes_list = [];
			$scope.primary_weapons_list = [];
			$scope.secondary_weapons_list = [];
			$scope.melee_weapons_list = [];
			$scope.sentinel_weapons_list = [];
			$scope.archwing_primary_weapons_list = [];
			$scope.archwing_melee_weapons_list = [];
			$scope.gear_parts_list = [];

			for (var index = 0; index < Response.data.length; index++) {
				$scope.all_gear_list.push(Response.data[index]);
				if (Response.data[index].item_type == 'Warframe') {
					$scope.warframes_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Primary Weapon') {
					$scope.primary_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Secondary Weapon') {
					$scope.secondary_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Melee Weapon') {
					$scope.melee_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Sentinel Weapon') {
					$scope.sentinel_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Archwing Primary Weapon') {
					$scope.archwing_primary_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Archwing Melee Weapon') {
					$scope.archwing_melee_weapons_list.push(Response.data[index]);
				}
				else if (Response.data[index].item_type == 'Gear Part') {
					$scope.gear_parts_list.push(Response.data[index]);
				}
			}

			$scope.$apply();

			$('#search_gear_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#all_gear_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#warframes_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#primary_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#secondary_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#melee_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#sentinel_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#archwing_primary_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});
			$('#archwing_melee_weapons_list').DataTable({
				"paging": false,
				"info": false,
				"ordering": true,
				"searching": true,
				"search": {
					"smart": true,
					"caseInsensitive": true
				}
			});


			// if (Response.item_type == '') {
			// 	$scope.all_gear_list = Response.data;
			// 	$scope.$apply();
			// 	$('#search_gear_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false,
			// 		"searching": true,
			// 		"search": {
			// 			"smart": true,
			// 			"caseInsensitive": true
			// 		}
			// 	});
			// 	$('#all_gear_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Warframe') {
			// 	$scope.warframes_list = Response.data;
			// 	$scope.$apply();
			// 	$('#warframes_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Primary Weapon') {
			// 	$scope.primary_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#primary_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Secondary Weapon') {
			// 	$scope.secondary_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#secondary_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Melee Weapon') {
			// 	$scope.melee_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#melee_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Sentinel Weapon') {
			// 	$scope.sentinel_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#sentinel_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Archwing Primary Weapon') {
			// 	$scope.archwing_primary_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#archwing_primary_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }
			// else if (Response.item_type == 'Archwing Melee Weapon') {
			// 	$scope.archwing_melee_weapons_list = Response.data;
			// 	$scope.$apply();
			// 	$('#archwing_melee_weapons_list').DataTable({
			// 		"paging": false,
			// 		"ordering": false,
			// 		"info": false
			// 	});
			// }

			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		Item Data
		//
		//=====================================================================
		//=====================================================================


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


		//==========================================
		$scope.SelectCurrentItem = function SelectCurrentItem(Item) {
			$scope.current_item = Item;
			$scope.current_item_name = Item.name;
			// $scope.$apply();
			$scope.show_item_view_modal();
			return;
		};


		//==========================================
		$scope.get_item_data_request = function get_item_data_request(ItemName) {
			$scope.notice = "Getting item data ...";
			$scope.errors = [];
			$scope.current_item = null;
			socket.emit('get_item_data_request', ItemName);
			return;
		};


		//==========================================
		socket.on('get_item_data_response', function(Item) {
			$scope.notice = "Got item data for [" + Item.item_name + "].";
			$scope.current_item = Item;
			$scope.$apply();
			$scope.show_item_view_modal();
			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		App Startup
		//
		//=====================================================================
		//=====================================================================

		$scope.notice = "";
		$scope.errors = [];

		$scope.item_list = null;
		$scope.current_item = null;

		$scope.all_gear_list = null;
		$scope.warframes_list = null;
		$scope.primary_weapons_list = null;
		$scope.secondary_weapons_list = null;
		$scope.archwing_primary_weapons_list = null;
		$scope.sentinel_weapons_list = null;

		// Initialize the item list.
		$scope.list_items_request("", false);

		// $scope.list_items_request("Warframe");
		// $scope.list_items_request("Primary Weapon");
		// $scope.list_items_request("Secondary Weapon");
		// $scope.list_items_request("Archwing Primary Weapon");
		// $scope.list_items_request("Sentinel Weapon");
		// $scope.list_items_request("Melee Weapon");
		// $scope.list_items_request("Archwing Melee Weapon");

		// $scope.list_items_request("Void Relic");
		// $scope.list_items_request("Gear Part");
		// $scope.list_items_request("Mod");

	});
