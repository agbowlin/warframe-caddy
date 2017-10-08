//=====================================================================
//=====================================================================
//
//		3.generate-indexes.js
//
//=====================================================================
//=====================================================================


//=====================================================================
// Include Modules
//=====================================================================

var npm_process = require('process');
var npm_fs = require('fs');
var npm_path = require('path');

var npm_command_line_args = require('command-line-args');
var npm_command_line_usage = require('command-line-usage');

var jsondiffpatch = require('jsondiffpatch');

var Logger = require('liqui-logger/js/logger').Logger();
var Parser = require('liquicode_dev_common/js/parsing');


//---------------------------------------------------------------------
//	Define the command line arguments
//---------------------------------------------------------------------


const usage_definitions = [{
		name: 'production',
		description: 'Run in production mode. This will overwrite distribution files in production.',
		alias: 'p',
		type: Boolean,
		typeLabel: '[underline]{boolean}'
	},
	{
		name: 'archive',
		description: 'Archive the compiled data to the history folder.',
		alias: 'a',
		type: Boolean,
		typeLabel: '[underline]{boolean}'
	},
	{
		name: 'logflags',
		description: 'The logging flags to use for console output. Can be any combination of "TDIWEF". Defualt is "IWEF".',
		alias: 'l',
		type: String,
		typeLabel: '[underline]{flags}'
	},
	{
		name: 'help',
		description: 'Print this help.',
		alias: 'h',
		type: Boolean,
		typeLabel: ''
	}
];


const usage_sections = [{
		header: '3.generate-indexes.js',
		content: 'Compile data sources and generate data files for the warframe-caddy server.'
	},
	{
		header: 'Synopsis',
		content: '$ node 3.generate-indexes.js <options>'
	},
	{
		header: 'Options',
		optionList: usage_definitions
	}
]


const app_options = npm_command_line_args(usage_definitions);
if (app_options.help) {
	console.log(npm_command_line_usage(usage_sections));
	npm_process.exit(0);
}


//=====================================================================
// Initialize Global Variables
//=====================================================================

var WfWikia_DataPath = 'warframe.wikia.data';
var WfMarket_DataPath = 'warframe.market-items';

var LogFlags = 'IWEF';
if (app_options.logflags) {
	LogFlags = app_options.logflags;
}

{ // Initialize the Logger
	Logger.Config.group = '3.generate-indexes';
	var console_log_target = Logger.AddLogTarget('console', LogFlags);
	var file_log_target = Logger.AddLogTarget('file');
	file_log_target.log_path = '_logs';
	file_log_target.log_filename = Logger.Config.group;
	file_log_target.use_hourly_logfiles = true;
}


//=====================================================================
// Startup
//=====================================================================

Logger.LogInfo("... Starting up ...");

//=====================================================================
// Load all wikia data
//=====================================================================

function _LoadJsonFile(Filename) {
	Logger.LogTrace("Loading JSON File [" + Filename + "]");
	return JSON.parse(npm_fs.readFileSync(Filename));

}

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

Logger.LogInfo("Found [" + WikiaItems.length + "] items in wikia data.");
// npm_fs.writeFileSync('data/all-items-data.json', JSON.stringify(WikiaItems, null, 4));


//=====================================================================
// Load warframe market data
//=====================================================================

var wfmkt_item_count = 0;
var wfmkt_new_item_count = 0;

var wfmkt_items_path = npm_path.join(WfMarket_DataPath, '/items');
npm_fs.readdirSync(wfmkt_items_path).forEach(filename => {

	var wfmkt_item = _LoadJsonFile(npm_path.join(wfmkt_items_path, filename));
	wfmkt_item_count++;

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
			wfmkt_new_item_count++;
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
			wfmkt_new_item_count++;
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
			wfmkt_new_item_count++;
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
			wfmkt_new_item_count++;
		}
	}

});

Logger.LogInfo("Found [" + wfmkt_item_count + "] items in Warframe Market. " + wfmkt_new_item_count + " new items.");


//=====================================================================
//	Sort the items
//=====================================================================

Logger.LogInfo("Sorting [" + WikiaItems.length + "] items.");
WikiaItems.sort(function(a, b) {
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	return 0;
});


//=====================================================================
//	Save the items
//=====================================================================

// Get the timestamp.
var timestamp_date = new Date();
var timestamp_text = timestamp_date.toISOString();
var filename = '';

// Save for history.
if (app_options.archive) {
	Logger.LogInfo("Archiving data to history folder");
	filename = npm_path.join(__dirname, 'data/history/all-items-data.' + timestamp_text + '.json');
	Logger.LogDebug("    > " + filename);
	npm_fs.writeFileSync(filename, JSON.stringify(WikiaItems, null, 4));
}

// Load the current data.
Logger.LogInfo("Reading the current data for differences");
filename = npm_path.join(__dirname, 'data/all-items-data.json');
Logger.LogDebug("    > " + filename);
var last_version = JSON.parse(npm_fs.readFileSync(filename));

// Calculate the difference.
Logger.LogInfo("Calculating differences");
var delta = jsondiffpatch.diff(last_version, WikiaItems);

// Store the difference.
if (delta) {
	Logger.LogInfo("Writing differences");
	filename = npm_path.join(__dirname, 'data/history/all-items-data.' + timestamp_text + '.delta.json');
	Logger.LogDebug("    > " + filename);
	npm_fs.writeFileSync(filename, JSON.stringify(delta, null, 4));
}
else {
	Logger.LogWarn("No differences detected. Difference file not written.");
}


//=====================================================================
//	Create the production files
//=====================================================================

if (app_options.production) {
	// Save items for distribution.
	Logger.LogInfo("Writing data for distribution");
	filename = npm_path.join(__dirname, 'data/all-items-data.json');
	Logger.LogDebug("    > " + filename);
	npm_fs.writeFileSync(filename, JSON.stringify(WikiaItems, null, 4));

	Logger.LogInfo("Creating index");
	var data_index = [];
	for (var index = 0; index < WikiaItems.length; index++) {
		var new_item = {};
		new_item.name = WikiaItems[index].name;
		new_item.item_type = WikiaItems[index].item_type;
		data_index.push(new_item);
	}

	Logger.LogInfo("Writing index");
	filename = npm_path.join(__dirname, 'data/all-items-index.json');
	Logger.LogDebug("    > " + filename);
	npm_fs.writeFileSync(filename, JSON.stringify(data_index, null, 4));
}
else {
	Logger.LogWarn("Production mode not enabled. Distribution files not written.");
}

//=====================================================================
// Exit
//=====================================================================

Logger.LogInfo("... Shutting down ...");
npm_process.exit(0);
