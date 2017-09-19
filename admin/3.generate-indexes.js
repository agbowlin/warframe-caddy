//=====================================================================
//=====================================================================
//
//		3.generate-indexes.js
//
//=====================================================================
//=====================================================================


//=====================================================================
// Include Modules

var npm_process = require('process');
var npm_fs = require('fs');
var npm_path = require('path');

var Logger = require('liqui-logger/js/logger').Logger();
var Parser = require('liquicode_dev_common/js/parsing');


//=====================================================================
// Initialize Global Variables

var WfWikia_DataPath = 'warframe.wikia.data';
var WfMarket_DataPath = 'warframe.market-items';

{ // Initialize the Logger
	Logger.Config.group = '3.generate-indexes';
	var console_log_target = Logger.AddLogTarget('console', 'TDIWEF');
	var file_log_target = Logger.AddLogTarget('file');
	file_log_target.log_path = '_logs';
	file_log_target.log_filename = Logger.Config.group;
	file_log_target.use_hourly_logfiles = true;
}


//=====================================================================
// Startup

Logger.LogInfo("... Starting up ...");

function _LoadJsonFile(Filename) {
	Logger.LogInfo("Loading JSON File [" + Filename + "]");
	return JSON.parse(npm_fs.readFileSync(Filename));

}

//=====================================================================
// Load all wikia data

var WikiaItems = [];
var WikiaItemsIndex = [];

{
	var items = null;

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'warframes.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Warframe';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-primary.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Primary Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-secondary.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Secondary Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-melee.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Melee Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-archwing-primary.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Archwing Primary Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-archwing-melee.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Archwing Melee Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'weapons-sentinel.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Sentinel Weapon';
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'void-relics.json'));
	items.forEach(
		function(item) {
			item.item_type = 'Void Relic';
			item.name = item.tier + " " + item.type;
			WikiaItems.push(item);
			WikiaItemsIndex[item.name] = item;
		});

	items = _LoadJsonFile(npm_path.join(WfWikia_DataPath, 'void-relic-rewards.json'));
	items.forEach(
		function(item) {
			var new_item = {};
			new_item.item_type = 'Gear Part';
			new_item.name = item.part_name;
			new_item.applies_to = item.item_name;
			WikiaItems.push(new_item);
			WikiaItemsIndex[new_item.name] = new_item;
		});

}

Logger.LogInfo("Loaded [" + WikiaItems.length + "] items.");
npm_fs.writeFileSync('data/all-items-data.json', JSON.stringify(WikiaItems, null, 4));


//=====================================================================
// Load warframe market data

var wfmkt_items_path = npm_path.join(WfMarket_DataPath, '/items');
npm_fs.readdirSync(wfmkt_items_path).forEach(filename => {

	var wfmkt_item = _LoadJsonFile(npm_path.join(wfmkt_items_path, filename));

	if (!wfmkt_item.tradable) {
		Logger.LogDebug("\tItem not tradable.");
		return;
	}

	if (wfmkt_item.tags.indexOf('set') >= 0) {
		// Ignore item sets.
	}
	else if (wfmkt_item.tags.indexOf('helmet') >= 0) {
		var indexed_item = WikiaItemsIndex[wfmkt_item.en.item_name];
		if (!indexed_item) {
			indexed_item = {};
			indexed_item.name = wfmkt_item.en.item_name;
			indexed_item.item_type = 'Helmet';
			WikiaItemsIndex[indexed_item.name] = indexed_item;
			WikiaItems.push(indexed_item);
			Logger.LogDebug("\tNew Helmet.");
		}

		indexed_item.tradable = true;
		indexed_item.trade_tax = wfmkt_item.trading_tax;
	}
	else if (wfmkt_item.tags.indexOf('mod') >= 0) {
		var indexed_item = WikiaItemsIndex[wfmkt_item.en.item_name];
		if (!indexed_item) {
			indexed_item = {};
			indexed_item.name = wfmkt_item.en.item_name;
			indexed_item.item_type = 'Mod';
			indexed_item.link = wfmkt_item.en.wiki_link;
			indexed_item.link = Parser.Parse_GetTextAfter(indexed_item.link, 'http://warframe.wikia.com');
			WikiaItemsIndex[indexed_item.name] = indexed_item;
			WikiaItems.push(indexed_item);
			Logger.LogDebug("\tNew Mod.");
		}

		indexed_item.tradable = true;
		indexed_item.trade_tax = wfmkt_item.trading_tax;
	}
	else if ((wfmkt_item.tags.indexOf('parts') >= 0) ||
		(wfmkt_item.tags.indexOf('blueprint') >= 0)) {
		var indexed_item = WikiaItemsIndex[wfmkt_item.en.item_name];
		if (!indexed_item) {
			indexed_item = WikiaItemsIndex[wfmkt_item.en.item_name + ' Blueprint'];
		}
		if (!indexed_item) {
			indexed_item = {};
			indexed_item.name = wfmkt_item.en.item_name;
			indexed_item.item_type = 'Gear Part';
			WikiaItemsIndex[indexed_item.name] = indexed_item;
			WikiaItems.push(indexed_item);
			Logger.LogDebug("\tNew Gear Part.");
		}

		indexed_item.tradable = true;
		indexed_item.trade_tax = wfmkt_item.trading_tax;
		indexed_item.value_ducats = wfmkt_item.ducats;
	}
	else {
		var indexed_item = WikiaItemsIndex[wfmkt_item.en.item_name];
		if (!indexed_item) {
			indexed_item = {};
			indexed_item.name = wfmkt_item.en.item_name;
			indexed_item.item_type = 'Other';
			WikiaItemsIndex[indexed_item.name] = indexed_item;
			WikiaItems.push(indexed_item);
			Logger.LogDebug("\tNew Other item.");
		}
	}

});


//=====================================================================
// Cleanup


Logger.LogInfo("Sorting [" + WikiaItems.length + "] items.");
WikiaItems.sort(function(a, b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	return 0;
});


Logger.LogInfo("Saving data to file [all-items-data.json].");
npm_fs.writeFileSync('data/all-items-data.json', JSON.stringify(WikiaItems, null, 4));


//=====================================================================
// Exit

Logger.LogInfo("... Shutting down ...");
npm_process.exit(0);
