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
			socket.emit('list_items_request', ItemType);
			return;
		};


		//==========================================
		socket.on('list_items_response', function(Response) {
			$scope.notice = "Listed [" + Response.data.length + "] items.";
			if (Response.item_type == 'Gear Part') {
				$scope.parts_list = Response.data;
				$scope.$apply();
				$('#parts_list').DataTable({
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

		$scope.parts_list = null;

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
		$scope.list_items_request("Gear Part");

	});
