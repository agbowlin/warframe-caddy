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
					if ($scope.parts_list[index].value_ducats) {
						part_values[$scope.parts_list[index].name] = $scope.parts_list[index].value_ducats;
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

				$scope.SelectRelicTier('Lith');
				
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

			return;
		};


		// //==========================================
		// function _AppendUniqueArray(A1, A2) {
		// 	for (var index = 0; index < A2.length; index++) {
		// 		if (A1.indexOf(A2[index]) < 0) {
		// 			A1.push(A2[index]);
		// 		}
		// 	}
		// 	return;
		// };


		//==========================================
		function build_rewards_list(AllRewards, RelicRewards, RewardType) {
			for (var index = 0; index < RelicRewards.length; index++) {
				var intersection = AllRewards.find(function(item) { return RelicRewards[index] == item.reward; });
				if (!intersection) {
					AllRewards.push({
						reward: RelicRewards[index],
						type: RewardType
					});
				}
			}
			return;
		}


		//==========================================
		$scope.UpdateRelicSelection = function UpdateRelicSelection() {

			$scope.selected_relic_rewards = [];

			if ($scope.selected_relic_1) {
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_1.common, 'common');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_1.uncommon, 'uncommon');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_1.rare, 'rare');
			}

			if ($scope.selected_relic_2) {
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_2.common, 'common');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_2.uncommon, 'uncommon');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_2.rare, 'rare');
			}

			if ($scope.selected_relic_3) {
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_3.common, 'common');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_3.uncommon, 'uncommon');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_3.rare, 'rare');
			}

			if ($scope.selected_relic_4) {
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_4.common, 'common');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_4.uncommon, 'uncommon');
				build_rewards_list($scope.selected_relic_rewards, $scope.selected_relic_4.rare, 'rare');
			}

			$scope.selected_relic_rewards.sort(
				function(A, B) {
					if (A.reward < B.reward) { return -1; }
					else if (A.reward > B.reward) { return 1; }
					else { return 0; }
				});

			// $scope.$apply();
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

		$scope.parts_list = null;
		$scope.relics_list = null;

		$scope.selected_relic_tier = null;
		$scope.selectable_relics_list = null;
		$scope.selected_relic_1 = null;
		$scope.selected_relic_2 = null;
		$scope.selected_relic_3 = null;
		$scope.selected_relic_4 = null;
		$scope.selected_relic_rewards = null;

		// Initialize the item list.
		$scope.list_items_request("Gear Part");
		$scope.list_items_request("Void Relic");

	});
