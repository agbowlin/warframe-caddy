/* global $ */
/* global io */
/* global angular */


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
		//		Member Data
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		$scope.member_data_request = function member_data_request(MemberName) {
			$scope.notice = "Retrieving membership data ...";
			$scope.errors = [];
			socket.emit('member_data_request', MemberName);
			return;
		};


		//==========================================
		socket.on('member_data_response', function(MemberData) {
			if (!MemberData) {
				$scope.notice = "Unable to retrieve membership data.";
				$scope.$apply();
				return;
			}
			$scope.notice = "Retrieved membership data for [" + MemberData.member_name + "].";
			$scope.member_data = MemberData;
			$scope.member_name = MemberData.member_name;
			$scope.$apply();
			return;
		});


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
			// $scope.item_list = [];
			socket.emit('list_items_request', ItemType);
			return;
		};


		//==========================================
		socket.on('list_items_response', function(Response) {
			$scope.notice = "Listed [" + Response.data.length + "] items.";
			if (Response.item_type == 'Warframe') {
				$scope.warframes_list = Response.data;
				$scope.$apply();
				$('#warframes_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Primary Weapon') {
				$scope.primary_weapons_list = Response.data;
				$scope.$apply();
				$('#primary_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Secondary Weapon') {
				$scope.secondary_weapons_list = Response.data;
				$scope.$apply();
				$('#secondary_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Archwing Primary Weapon') {
				$scope.archwing_primary_weapons_list = Response.data;
				$scope.$apply();
				$('#archwing_primary_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Sentinel Weapon') {
				$scope.sentinel_weapons_list = Response.data;
				$scope.$apply();
				$('#sentinel_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Melee Weapon') {
				$scope.melee_weapons_list = Response.data;
				$scope.$apply();
				$('#melee_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			else if (Response.item_type == 'Archwing Melee Weapon') {
				$scope.archwing_melee_weapons_list = Response.data;
				$scope.$apply();
				$('#archwing_melee_weapons_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
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
		$scope.select_current_item = function select_current_item(ItemName) {
			$scope.current_item_name = ItemName;
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
		$scope.member_data = null;
		$scope.member_name = null;
		$scope.item_list = null;
		$scope.current_item = null;

		$scope.warframes_list = null;
		$scope.primary_weapons_list = null;
		$scope.secondary_weapons_list = null;
		$scope.archwing_primary_weapons_list = null;
		$scope.sentinel_weapons_list = null;

		//==========================================
		//	Setup Member Data
		//==========================================

		// Get the member info from a browser cookie.
		$scope.member_name = $cookies.get('my-warframe.member_name');
		if ($scope.member_name) {
			// Retrieve the member data from the server.
			$scope.member_data_request($scope.member_name);
		}

		// Initialize the item list.
		$scope.list_items_request("Warframe");
		$scope.list_items_request("Primary Weapon");
		$scope.list_items_request("Secondary Weapon");
		$scope.list_items_request("Archwing Primary Weapon");
		$scope.list_items_request("Sentinel Weapon");
		$scope.list_items_request("Melee Weapon");
		$scope.list_items_request("Archwing Melee Weapon");
		// $scope.list_items_request("Void Relic");
		// $scope.list_items_request("Gear Part");
		// $scope.list_items_request("Mod");
		
	});
