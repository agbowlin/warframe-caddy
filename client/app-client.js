"use strict";

//---------------------------------------------------------------------
function AppClient() {
	return;
}


//---------------------------------------------------------------------
var ERR_AppClientError = new Error("Application Client Error.");


//---------------------------------------------------------------------
AppClient.Connect =
	function Connect(Scope, ThisApp, Member, Socket, Logger) {


		//==========================================
		Scope.WarframeCaddy = {};
		var WarframeCaddy = Scope.WarframeCaddy;


		//=====================================================================
		//=====================================================================
		//
		//		Worldstate
		//
		//=====================================================================
		//=====================================================================


		WarframeCaddy.Worldstate = null;

		WarframeCaddy.GetWorldstate =
			function GetWorldstate() {
				WarframeCaddy.Worldstate = null;
				Socket.emit('get_worldstate_request');
				return;
			};

		Socket.on('get_worldstate_response', function(Worldstate) {
			WarframeCaddy.Worldstate = Worldstate;
			Scope.$apply();
			return;
		});


		//=====================================================================
		//=====================================================================
		//
		//		Inventory
		//
		//=====================================================================
		//=====================================================================


		WarframeCaddy.ItemList = null;
		WarframeCaddy.ItemLookup = null;
		WarframeCaddy.WarframesList = null;
		WarframeCaddy.PrimaryWeaponsList = null;
		WarframeCaddy.SecondaryWeaponsList = null;
		WarframeCaddy.MeleeWeaponsList = null;
		WarframeCaddy.SentinelWeaponsList = null;
		WarframeCaddy.ArchwingPrimaryWeaponsList = null;
		WarframeCaddy.ArchwingMeleeWeaponsList = null;
		WarframeCaddy.GearPartsList = null;
		WarframeCaddy.ModsList = null;
		WarframeCaddy.VoidRelicsList = null;


		//==========================================
		WarframeCaddy.GetItems =
			function GetItems() {
				WarframeCaddy.ItemList = null;
				WarframeCaddy.ItemLookup = {};
				WarframeCaddy.WarframesList = [];
				WarframeCaddy.PrimaryWeaponsList = [];
				WarframeCaddy.SecondaryWeaponsList = [];
				WarframeCaddy.MeleeWeaponsList = [];
				WarframeCaddy.SentinelWeaponsList = [];
				WarframeCaddy.ArchwingPrimaryWeaponsList = [];
				WarframeCaddy.ArchwingMeleeWeaponsList = [];
				WarframeCaddy.GearPartsList = [];
				WarframeCaddy.ModsList = [];
				WarframeCaddy.VoidRelicsList = [];
				Socket.emit('list_items_request');
				return;
			};

		Socket.on('list_items_response', function(Response) {

			WarframeCaddy.ItemList = Response.data;

			for (var index = 0; index < WarframeCaddy.ItemList.length; index++) {
				var item = WarframeCaddy.ItemList[index];
				WarframeCaddy.ItemLookup[item.name] = item;
				if (item.item_type == 'Warframe') {
					WarframeCaddy.WarframesList.push(item);
				}
				else if (item.item_type == 'Primary Weapon') {
					WarframeCaddy.PrimaryWeaponsList.push(item);
				}
				else if (item.item_type == 'Secondary Weapon') {
					WarframeCaddy.SecondaryWeaponsList.push(item);
				}
				else if (item.item_type == 'Melee Weapon') {
					WarframeCaddy.MeleeWeaponsList.push(item);
				}
				else if (item.item_type == 'Sentinel Weapon') {
					WarframeCaddy.SentinelWeaponsList.push(item);
				}
				else if (item.item_type == 'Archwing Primary Weapon') {
					WarframeCaddy.ArchwingPrimaryWeaponsList.push(item);
				}
				else if (item.item_type == 'Archwing Melee Weapon') {
					WarframeCaddy.ArchwingMeleeWeaponsList.push(item);
				}
				else if (item.item_type == 'Gear Part') {
					WarframeCaddy.GearPartsList.push(item);
				}
				else if (item.item_type == 'Mod') {
					WarframeCaddy.ModsList.push(item);
				}
				else if (item.item_type == 'Void Relic') {
					WarframeCaddy.VoidRelicsList.push(item);
				}
			}

			// Update the relic rewards with ducat values.
			for (var index = 0; index < WarframeCaddy.VoidRelicsList.length; index++) {

				// Construct a Relic Name
				WarframeCaddy.VoidRelicsList[index].relic_name = WarframeCaddy.VoidRelicsList[index].tier + ' ' + WarframeCaddy.VoidRelicsList[index].type;

				// Common Drops
				for (var sub_index = 0; sub_index < WarframeCaddy.VoidRelicsList[index].common.length; sub_index++) {
					var part_name = WarframeCaddy.VoidRelicsList[index].common[sub_index];
					var part = WarframeCaddy.ItemLookup[part_name];
					if (part && part.value_ducats) {
						part_name += ' (' + part.value_ducats + 'd)';
					}
					WarframeCaddy.VoidRelicsList[index].common[sub_index] = part_name;
				}

				// Uncommon Drops
				for (var sub_index = 0; sub_index < WarframeCaddy.VoidRelicsList[index].uncommon.length; sub_index++) {
					var part_name = WarframeCaddy.VoidRelicsList[index].uncommon[sub_index];
					var part = WarframeCaddy.ItemLookup[part_name];
					if (part && part.value_ducats) {
						part_name += ' (' + part.value_ducats + 'd)';
					}
					WarframeCaddy.VoidRelicsList[index].uncommon[sub_index] = part_name;
				}

				// Rare Drops
				for (var sub_index = 0; sub_index < WarframeCaddy.VoidRelicsList[index].rare.length; sub_index++) {
					var part_name = WarframeCaddy.VoidRelicsList[index].rare[sub_index];
					var part = WarframeCaddy.ItemLookup[part_name];
					if (part && part.value_ducats) {
						part_name += ' (' + part.value_ducats + 'd)';
					}
					WarframeCaddy.VoidRelicsList[index].rare[sub_index] = part_name;
				}
			}

			Scope.$apply();
		});


		//=====================================================================
		//=====================================================================
		//
		//		Item Usage
		//
		//=====================================================================
		//=====================================================================


		WarframeCaddy.ItemUsage = null;
		WarframeCaddy.ItemUsageDirty = false;


		//==========================================
		WarframeCaddy.GetItemUsage =
			function GetItemUsage() {
				WarframeCaddy.ItemUsage = null;
				Scope.Member.PathRead_Promise('item-usage.json')
					.then(
						function(Content) {
							WarframeCaddy.ItemUsage = Content;
							WarframeCaddy.ItemUsageDirty = false;
							Scope.$apply();
						})
					.catch(
						function(error) {
							console.log("Error: " + error);
						})
					.finally(
						function() {});
				return;
			};


		//==========================================
		WarframeCaddy.PutItemUsage =
			function PutItemUsage() {
				Scope.Member.PathWrite_Promise('item-usage.json', WarframeCaddy.ItemUsage)
					.then(
						function(Content) {
							// Saved WarframeCaddy.ItemUsage
							WarframeCaddy.ItemUsageDirty = false;
							Scope.$apply();
						})
					.catch(
						function(error) {
							console.log("Error: " + error);
						})
					.finally(
						function() {});
				return;
			};


		//==========================================
		WarframeCaddy.ChangeItemUsage_ItemLevel =
			function ChangeItemUsage(ItemName, ChangeAmount) {
				var item = WarframeCaddy.ItemUsage.items[ItemName];
				if (!item) {
					item = { item_level: 0 }
					WarframeCaddy.ItemUsage.items[ItemName] = item;
				};
				item.item_level = item.item_level + ChangeAmount;
				if (item.item_level < 0) { item.item_level = 0; }
				if (item.item_level > 30) { item.item_level = 30; }
				WarframeCaddy.ItemUsageDirty = true;
				return;
			};


		//==========================================
		WarframeCaddy.ChangeItemUsage_ItemCount =
			function ChangeItemUsage(ItemName, ChangeAmount) {
				var item = WarframeCaddy.ItemUsage.items[ItemName];
				if (!item) {
					item = { item_owned: 0 }
					WarframeCaddy.ItemUsage.items[ItemName] = item;
				};
				item.item_owned = item.item_owned + ChangeAmount;
				if (item.item_owned < 0) { item.item_owned = 0; }
				WarframeCaddy.ItemUsageDirty = true;
				return;
			};


		//==========================================
		WarframeCaddy.ChangeItemUsage_Note =
			function ChangeItemUsage(ItemName, NoteText) {
				var item = WarframeCaddy.ItemUsage.items[ItemName];
				if (!item) {
					item = { notes: 0 }
					WarframeCaddy.ItemUsage.items[ItemName] = item;
				};
				item.notes = NoteText;
				WarframeCaddy.ItemUsageDirty = true;
				return;
			};


		//=====================================================================
		//=====================================================================
		//
		//		Fissure Mission
		//
		//=====================================================================
		//=====================================================================

		WarframeCaddy.SelectedRelicTier = '';
		WarframeCaddy.SelectableRelicsList = [];
		WarframeCaddy.SelectedRelic1 = null;
		WarframeCaddy.SelectedRelic2 = null;
		WarframeCaddy.SelectedRelic3 = null;
		WarframeCaddy.SelectedRelic4 = null;
		WarframeCaddy.SelectedRelicRewards = null;


		//==========================================
		WarframeCaddy.SelectRelicTier =
			function SelectRelicTier(TierName) {
				WarframeCaddy.SelectedRelicTier = TierName;

				// Generate the selectable relics list.
				WarframeCaddy.SelectableRelicsList = [];
				for (var index = 0; index < WarframeCaddy.VoidRelicsList.length; index++) {
					if (WarframeCaddy.VoidRelicsList[index].tier == WarframeCaddy.SelectedRelicTier) {
						WarframeCaddy.SelectableRelicsList.push(WarframeCaddy.VoidRelicsList[index]);
					}
				}

				WarframeCaddy.SelectedRelic1 = null;
				WarframeCaddy.SelectedRelic2 = null;
				WarframeCaddy.SelectedRelic3 = null;
				WarframeCaddy.SelectedRelic4 = null;
				WarframeCaddy.SelectedRelicRewards = null;
			};


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
		WarframeCaddy.UpdateRelicSelection =
			function UpdateRelicSelection() {

				WarframeCaddy.SelectedRelicRewards = [];

				if (WarframeCaddy.SelectedRelic1) {
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic1.common, 'common');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic1.uncommon, 'uncommon');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic1.rare, 'rare');
				}

				if (WarframeCaddy.SelectedRelic2) {
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic2.common, 'common');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic2.uncommon, 'uncommon');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic2.rare, 'rare');
				}

				if (WarframeCaddy.SelectedRelic3) {
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic3.common, 'common');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic3.uncommon, 'uncommon');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic3.rare, 'rare');
				}

				if (WarframeCaddy.SelectedRelic4) {
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic4.common, 'common');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic4.uncommon, 'uncommon');
					build_rewards_list(WarframeCaddy.SelectedRelicRewards, WarframeCaddy.SelectedRelic4.rare, 'rare');
				}

				WarframeCaddy.SelectedRelicRewards.sort(
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
		//		UI Setup
		//
		//=====================================================================
		//=====================================================================

		/* gloabl $ */

		// Add navigation items to the sidebar.

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-worldstate-item',
				caption: 'Worldstate',
				partial_name: 'app-worldstate',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-warframes-item',
				caption: 'Warframes',
				partial_name: 'app-warframes',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-warframes-weapons-group',
				caption: 'Weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				is_group: true
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-primary-weapons-item',
				caption: 'Primary Weapons',
				partial_name: 'app-primary-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-secondary-weapons-item',
				caption: 'Secondary Weapons',
				partial_name: 'app-secondary-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-melee-weapons-item',
				caption: 'Melee Weapons',
				partial_name: 'app-melee-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-sentinel-weapons-item',
				caption: 'Sentinel Weapons',
				partial_name: 'app-sentinel-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-archwing-primary-weapons-item',
				caption: 'Archwing Primary Weapons',
				partial_name: 'app-archwing-primary-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-warframes-weapons-group_items').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-archwing-melee-weapons-item',
				caption: 'Archwing Melee Weapons',
				partial_name: 'app-archwing-melee-weapons',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-gear-parts-item',
				caption: 'Gear Parts',
				partial_name: 'app-gear-parts',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-mods-item',
				caption: 'Mods',
				partial_name: 'app-mods',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-void-relics-item',
				caption: 'Void Relics',
				partial_name: 'app-void-relics',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);

		$('#app-sidebar-list').append(
			ThisApp.NewSidebarItem({
				item_name: 'app-fissure-mission-item',
				caption: 'Fissure Mission',
				partial_name: 'app-fissure-mission',
				requires_login: false,
				icon_class: 'glyphicon glyphicon-expand',
				on_click: function(Item) {
					ThisApp.LoadPartial(Item.partial_name);
				}
			})
		);


		//=====================================================================
		//=====================================================================
		//
		//		App Startup
		//
		//=====================================================================
		//=====================================================================


		//==========================================
		if (Scope.Member.member_logged_in) {
			WarframeCaddy.GetItemUsage();
		}
		WarframeCaddy.GetItems();
		WarframeCaddy.GetWorldstate();

		return;
	};



//=====================================================================
// Integrate with the browser environment.
if (typeof window != 'undefined') {
	window['AppClient'] = AppClient;
}


//=====================================================================
// Integrate with the nodejs environment.
if (typeof exports != 'undefined') {
	exports = AppClient;
}
if (typeof module != 'undefined') {
	if (typeof module.exports != 'undefined') {
		module.exports = AppClient;
	}
}
