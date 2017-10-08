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
		$scope.Member.OnGetMemberData = function(Success)
		{
			if (!Success) { return; }
			$scope.$apply();
			return;
		};

		//==========================================
		$scope.Member.OnPutMemberData = function(Success)
		{
			if (!Success) { return; }
			return;
		};


		//==========================================
		// Get the user data if our login is cached.
		if ($scope.Member.member_logged_in && !$scope.Member.member_data)
		{
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
			// $scope.item_list = [];
			socket.emit('list_items_request', ItemType);
			return;
		};


		//==========================================
		socket.on('list_items_response', function(Response) {
			$scope.notice = "Listed [" + Response.data.length + "] items.";
			if (Response.item_type == 'Mod') {
				$scope.mods_list = Response.data;
				$scope.$apply();
				$('#mods_list').DataTable({
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

		$scope.item_list = null;
		$scope.current_item = null;

		$scope.warframes_list = null;
		$scope.primary_weapons_list = null;
		$scope.secondary_weapons_list = null;
		$scope.archwing_primary_weapons_list = null;
		$scope.sentinel_weapons_list = null;

		// Initialize the item list.
		$scope.list_items_request("Mod");
		
//		$('li')

	});
