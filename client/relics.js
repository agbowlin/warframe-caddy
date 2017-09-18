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
			}
			else if (Response.item_type == 'Void Relic') {
				$scope.relics_list = Response.data;
			}

			if ($scope.parts_list && $scope.relics_list) {

				// Construct a lookup array of gear parts.
				var part_values = [];
				for (var index = 0; index < $scope.parts_list.length; index++) {
					if ($scope.parts_list[index].part_ducat_value) {
						part_values[$scope.parts_list[index].part_name] = $scope.parts_list[index].part_ducat_value;
					}
				}

				// Update the relic rewards with ducat values.
				for (var index = 0; index < $scope.relics_list.length; index++) {

					// Construct a Relic Name
					$scope.relics_list[index].relic_name = $scope.relics_list[index].tier + ' ' + $scope.relics_list[index].type;

					// Common Drops
					for (var sub_index = 0; sub_index < $scope.relics_list[index].common.length; sub_index++) {
						var part_name = $scope.relics_list[index].common[sub_index];
						if (part_values[part_name]) {
							part_name += ' (' + part_values[part_name] + 'd)';
						}
						$scope.relics_list[index].common[sub_index] = part_name;
					}

					// Uncommon Drops
					for (var sub_index = 0; sub_index < $scope.relics_list[index].uncommon.length; sub_index++) {
						var part_name = $scope.relics_list[index].uncommon[sub_index];
						if (part_values[part_name]) {
							part_name += ' (' + part_values[part_name] + 'd)';
						}
						$scope.relics_list[index].uncommon[sub_index] = part_name;
					}

					// Rare Drops
					for (var sub_index = 0; sub_index < $scope.relics_list[index].rare.length; sub_index++) {
						var part_name = $scope.relics_list[index].rare[sub_index];
						if (part_values[part_name]) {
							part_name += ' (' + part_values[part_name] + 'd)';
						}
						$scope.relics_list[index].rare[sub_index] = part_name;
					}
				}

				$scope.$apply();

				// Initialize the datatable.
				$('#relics_list').DataTable({
					"paging": false,
					"ordering": false,
					"info": false
				});
			}
			return;
		});


		//==========================================
		$scope.SelectRelicTier = function SelectRelicTier(RelicTier) {
			$scope.selected_relic_tier = RelicTier;

			// Generate the selectable relics list.
			$scope.selectable_relics_list = [];
			for (var index = 0; index < $scope.relics_list.length; index++) {
				if ($scope.relics_list[index].tier == $scope.selected_relic_tier) {
					$scope.selectable_relics_list.push($scope.relics_list[index]);
				}
			}

			$scope.selected_relic_1 = null;
			$scope.selected_relic_2 = null;
			$scope.selected_relic_3 = null;
			$scope.selected_relic_4 = null;
			$scope.selected_relic_rewards = null;

			$scope.$apply();
			return;
		};


		//==========================================
		function _AppendUniqueArray(A1, A2) {
			for (var index = 0; index < A2.length; index++) {
				if (A1.indexOf(A2[index]) < 0) {
					A1.push(A2[index]);
				}
			}
			return;
		};


		//==========================================
		$scope.UpdateRelicSelection = function UpdateRelicSelection() {

			$scope.selected_relic_rewards = [];

			if ($scope.selected_relic_1) {
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_1.common);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_1.uncommon);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_1.rare);
			}

			if ($scope.selected_relic_2) {
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_2.common);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_2.uncommon);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_2.rare);
			}

			if ($scope.selected_relic_3) {
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_3.common);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_3.uncommon);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_3.rare);
			}

			if ($scope.selected_relic_4) {
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_4.common);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_4.uncommon);
				_AppendUniqueArray($scope.selected_relic_rewards, $scope.selected_relic_4.rare);
			}

			$scope.selected_relic_rewards.sort();

			$scope.$apply();
			return;
		};


		//=====================================================================
		//=====================================================================
		//
		//		Item Data
		//
		//=====================================================================
		//=====================================================================


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
		$scope.relics_list = null;

		$scope.selected_relic_tier = null;
		$scope.selectable_relics_list = null;
		$scope.selected_relic_1 = null;
		$scope.selected_relic_2 = null;
		$scope.selected_relic_3 = null;
		$scope.selected_relic_4 = null;
		$scope.selected_relic_rewards = null;

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
		$scope.list_items_request("Void Relic");

	});
