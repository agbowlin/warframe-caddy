//=====================================================================
//=====================================================================
//
//	warframe.wikia.scrape-index.js
//
//	Scrapes the website at http://warframe.wikia.com
//	and stores the scraped data in json files located
//	in a subfolder.
//
//=====================================================================
//=====================================================================


var casper_system = require('system');
var casper_utils = require('utils');
var casper_fs = require('fs');


//=====================================================================
//=====================================================================
//
//  ┬┌┐┌┌┬┐┬┌─┐┬  ┬┌─┐┌─┐┌┬┐┬┌─┐┌┐┌
//  ││││ │ │├─┤│  │┌─┘├─┤ │ ││ ││││
//  ┴┘└┘ ┴ ┴┴ ┴┴─┘┴└─┘┴ ┴ ┴ ┴└─┘┘└┘
//
//=====================================================================
//=====================================================================


//=====================================================================
// Initialize the casper object.
var JQuery_js_Filename = 'node_modules/jquery/dist/jquery.min.js';
var Client_js_Filename = 'casper-dom-code.js';

var casper_options = {
	userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10) AppleWebKit/600.1.25 (KHTML, like Gecko) Version/8.0 Safari/600.1.25',
	// userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
	verbose: true,
	// logLevel: 'debug',
	logLevel: 'warning',
	// logLevel: 'error',
	pageSettings: {
		loadImages: false,
		loadPlugins: false
	},
	clientScripts: [
		// JQuery_js_Filename,
		// Client_js_Filename
	],
	viewportSize: {
		width: 800,
		height: 1000
	}
};

var casper = require('casper').create(casper_options);
var casper_xpath = require('casper').selectXPath;

//=====================================================================
// Initialize the Logger.
var Logger = require('liqui-logger/js/logger').Logger();
Logger.Config.group = 'warframe.wikia.scrape';
var console_log_target = Logger.AddLogTarget('console', 'TDIWEF');
var file_log_target = Logger.AddLogTarget('file');
file_log_target.log_path = '_logs';
file_log_target.log_filename = Logger.Config.group;
file_log_target.use_hourly_logfiles = true;

//=====================================================================
// Add utility functions to the casper object.
// require('../_dev_common/js/utils-casper')(casper, Logger, true, true);
require('liquicode_dev_common/js/utils-casper')(casper, Logger, false, false);
var parsing = require('liquicode_dev_common/js/parsing');


//=====================================================================
// Log the startup.
// Logger.LogMessage('Casper Status: ');
// casper.status(true);
Logger.LogDebug("Casper CLI passed args:", casper.cli.args);
Logger.LogDebug("Casper CLI passed options:", casper.cli.options);


//=====================================================================
// Parse the command line.
// var data_filename = '';
// if (casper.cli.has('data_filename')) {
// 	data_filename = casper.cli.get('data_filename');
// 	Logger.LogMessage('Using the data_filename [' + data_filename + '].');
// }


//=====================================================================
//=====================================================================
//
//  ╔╦╗┌─┐┬┌┐┌  ╔═╗─┐ ┬┌─┐┌─┐┬ ┬┌┬┐┬┌─┐┌┐┌
//  ║║║├─┤││││  ║╣ ┌┴┬┘├┤ │  │ │ │ ││ ││││
//  ╩ ╩┴ ┴┴┘└┘  ╚═╝┴ └─└─┘└─┘└─┘ ┴ ┴└─┘┘└┘
//
//=====================================================================
//=====================================================================


Logger.LogMessage('Casper starting');
casper.start();


//=====================================================================
casper.GetCellAttribute = function GetCellAttribute(TableRowSelector, RowNumber, CellNumber, InternalSelector, Attribute) {
	var text = this.getElementAttribute(TableRowSelector + ':nth-child(' + RowNumber + ') > td:nth-child(' + CellNumber + ') ' + InternalSelector, Attribute);
	text = parsing.Parse_CleanText(text);
	return text;
};


//=====================================================================
casper.GetCellText = function GetCellText(TableRowSelector, RowNumber, CellNumber) {
	var text = this.getElementInfo(TableRowSelector + ':nth-child(' + RowNumber + ') > td:nth-child(' + CellNumber + ')').text;
	text = parsing.Parse_CleanText(text);
	return text;
};


//=====================================================================
function _DecodeDamage(DamageText) {
	var text = DamageText;
	if (parsing.Parse_TextStartsWith(DamageText, '<img')) {
		text = parsing.Parse_GetTextAfterLast(DamageText, '>');
		var type = parsing.Parse_GetTextBetween(DamageText, ' alt="', '"');
		if (type) {
			type = parsing.Parse_GetTextBeforeLast(type, ' b');
			text += ' (' + type + ')';
		}
	}
	text = parsing.Parse_CleanText(text);
	return text;
}


//=====================================================================
function _WriteDataFile(Data, Filename) {
	var data_filename = casper_fs.join('warframe.wikia.data', Filename);
	var content = JSON.stringify(Data, undefined, 4);
	casper_fs.write(data_filename, content, 'w');
	return;
}


//=====================================================================
//
//		Warframes
//
casper.thenOpen('http://warframe.wikia.com/wiki/Warframes_Comparison',
	function() {
		Logger.LogDebug('Loaded [' + this.getCurrentUrl() + '].');

		var row_selector = '#mw-content-text > div > div > div:nth-child(2) > div > div:nth-child(3) > table > tbody > tr';
		var rows = this.getElementsInfo(row_selector);

		var items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.health = this.GetCellText(row_selector, row_number, 2);
			item.shields = this.GetCellText(row_selector, row_number, 3);
			item.energy = this.GetCellText(row_selector, row_number, 4);
			item.armor = this.GetCellText(row_selector, row_number, 5);
			item.sprint = this.GetCellText(row_selector, row_number, 6);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Warframes.');
		Logger.LogDebug('Writing data file [warframes.json].');
		_WriteDataFile(items, 'warframes.json');

	});


//=====================================================================
//
//		Weapons
//
casper.thenOpen('http://warframe.wikia.com/wiki/Weapon_Comparison',
	function() {
		Logger.LogDebug('Loaded [' + this.getCurrentUrl() + '].');

		//---------------------------------------------------------------------
		// Primary Weapons
		var row_selector = '#mw-content-text > div > div:nth-child(2) > div > div:nth-child(2) > table > tbody > tr';
		var rows = this.getElementsInfo(row_selector);

		var items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.trigger_type = this.GetCellText(row_selector, row_number, 2);
			item.damage = this.GetCellText(row_selector, row_number, 3);
			item.damage = _DecodeDamage(item.damage);
			item.critical_chance = this.GetCellText(row_selector, row_number, 4);
			item.critical_damage = this.GetCellText(row_selector, row_number, 5);
			item.status_chance = this.GetCellText(row_selector, row_number, 6);
			item.projectile_type = this.GetCellText(row_selector, row_number, 7);
			item.fire_rate = this.GetCellText(row_selector, row_number, 8);
			item.magazine_size = this.GetCellText(row_selector, row_number, 9);
			item.reload_time = this.GetCellText(row_selector, row_number, 10);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 11);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Primary Weapons.');
		Logger.LogDebug('Writing data file [weapons-primary.json].');
		_WriteDataFile(items, 'weapons-primary.json');

		//---------------------------------------------------------------------
		// Secondary Weapons
		row_selector = '#mw-content-text > div > div:nth-child(3) > div > div:nth-child(2) > table > tbody > tr';
		rows = this.getElementsInfo(row_selector);

		items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.trigger_type = this.GetCellText(row_selector, row_number, 2);
			item.damage = this.GetCellText(row_selector, row_number, 3);
			item.damage = _DecodeDamage(item.damage);
			item.critical_chance = this.GetCellText(row_selector, row_number, 4);
			item.critical_damage = this.GetCellText(row_selector, row_number, 5);
			item.status_chance = this.GetCellText(row_selector, row_number, 6);
			item.projectile_type = this.GetCellText(row_selector, row_number, 7);
			item.fire_rate = this.GetCellText(row_selector, row_number, 8);
			item.magazine_size = this.GetCellText(row_selector, row_number, 9);
			item.reload_time = this.GetCellText(row_selector, row_number, 10);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 11);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Secondary Weapons.');
		Logger.LogDebug('Writing data file [weapons-secondary.json].');
		_WriteDataFile(items, 'weapons-secondary.json');

		//---------------------------------------------------------------------
		// Melee Weapons
		row_selector = '#mw-content-text > div > div:nth-child(4) > div > div:nth-child(2) > table > tbody > tr';
		rows = this.getElementsInfo(row_selector);

		items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.type = this.GetCellText(row_selector, row_number, 2);
			item.damage = this.GetCellText(row_selector, row_number, 3);
			item.damage = _DecodeDamage(item.damage);
			item.slide = this.GetCellText(row_selector, row_number, 4);
			item.attack_speed = this.GetCellText(row_selector, row_number, 5);
			item.critical_chance = this.GetCellText(row_selector, row_number, 6);
			item.critical_damage = this.GetCellText(row_selector, row_number, 7);
			item.status_chance = this.GetCellText(row_selector, row_number, 8);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 9);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Melee Weapons.');
		Logger.LogDebug('Writing data file [weapons-melee.json].');
		_WriteDataFile(items, 'weapons-melee.json');

		//---------------------------------------------------------------------
		// Sentinel Weapons
		row_selector = '#mw-content-text > div > div:nth-child(5) > table > tbody > tr';
		rows = this.getElementsInfo(row_selector);

		items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.trigger_type = this.GetCellText(row_selector, row_number, 2);
			item.damage = this.GetCellText(row_selector, row_number, 3);
			item.damage = _DecodeDamage(item.damage);
			item.critical_chance = this.GetCellText(row_selector, row_number, 4);
			item.critical_damage = this.GetCellText(row_selector, row_number, 5);
			item.status_chance = this.GetCellText(row_selector, row_number, 6);
			item.projectile_type = this.GetCellText(row_selector, row_number, 7);
			item.fire_rate = this.GetCellText(row_selector, row_number, 8);
			item.magazine_size = this.GetCellText(row_selector, row_number, 9);
			item.reload_time = this.GetCellText(row_selector, row_number, 10);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 11);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Sentinel Weapons.');
		Logger.LogDebug('Writing data file [weapons-sentinel.json].');
		_WriteDataFile(items, 'weapons-sentinel.json');

		//---------------------------------------------------------------------
		// Archwing Primary Weapons
		row_selector = '#mw-content-text > div > div:nth-child(6) > table > tbody > tr';
		rows = this.getElementsInfo(row_selector);

		items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.trigger_type = this.GetCellText(row_selector, row_number, 2);
			item.damage = this.GetCellText(row_selector, row_number, 3);
			item.damage = _DecodeDamage(item.damage);
			item.critical_chance = this.GetCellText(row_selector, row_number, 4);
			item.critical_damage = this.GetCellText(row_selector, row_number, 5);
			item.status_chance = this.GetCellText(row_selector, row_number, 6);
			item.projectile_type = this.GetCellText(row_selector, row_number, 7);
			item.fire_rate = this.GetCellText(row_selector, row_number, 8);
			item.magazine_size = this.GetCellText(row_selector, row_number, 9);
			item.reload_time = this.GetCellText(row_selector, row_number, 10);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 11);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Archwing Primary Weapons.');
		Logger.LogDebug('Writing data file [weapons-archwing-primary.json].');
		_WriteDataFile(items, 'weapons-archwing-primary.json');

		//---------------------------------------------------------------------
		// Archwing Melee Weapons
		row_selector = '#mw-content-text > div > div:nth-child(7) > table > tbody > tr';
		rows = this.getElementsInfo(row_selector);

		items = [];
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			item.name = this.GetCellText(row_selector, row_number, 1);
			item.link = this.GetCellAttribute(row_selector, row_number, 1, '> a', 'href');
			item.damage = this.GetCellText(row_selector, row_number, 2);
			item.damage = _DecodeDamage(item.damage);
			item.slide = this.GetCellText(row_selector, row_number, 3);
			item.attack_speed = this.GetCellText(row_selector, row_number, 4);
			item.critical_chance = this.GetCellText(row_selector, row_number, 5);
			item.critical_damage = this.GetCellText(row_selector, row_number, 6);
			item.status_chance = this.GetCellText(row_selector, row_number, 7);
			item.mastery_rank = this.GetCellText(row_selector, row_number, 8);
			items.push(item);
		}
		Logger.LogDebug('Found [' + items.length + '] Archwing Melee Weapons.');
		Logger.LogDebug('Writing data file [weapons-archwing-melee.json].');
		_WriteDataFile(items, 'weapons-archwing-melee.json');

	});


//=====================================================================
//
//		Void Relics
//
casper.thenOpen('http://warframe.wikia.com/wiki/Void_Relic',
	function() {
		Logger.LogDebug('Loaded [' + this.getCurrentUrl() + '].');

		var row_selector = '#mw-customcollapsible-rewarddrops > div > div > div:nth-child(2) > table > tbody > tr';
		var rows = this.getElementsInfo(row_selector);

		var items = [];
		var drops = {};
		for (var row_number = 1; row_number <= rows.length; row_number++) {
			var item = {};
			var drop = {};

			item.tier = this.GetCellText(row_selector, row_number, 1);
			item.type = this.GetCellText(row_selector, row_number, 2);

			// Common Drops
			item.common = [];

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(3) > ul > li:nth-child(1) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(1) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(1) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.common.push(drop.part_name);

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(3) > ul > li:nth-child(2) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(2) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(2) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.common.push(drop.part_name);

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(3) > ul > li:nth-child(3) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(3) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 3, '> ul > li:nth-child(3) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.common.push(drop.part_name);

			// Uncommon Drops
			item.uncommon = [];

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(4) > ul > li:nth-child(1) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 4, '> ul > li:nth-child(1) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 4, '> ul > li:nth-child(1) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.uncommon.push(drop.part_name);

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(4) > ul > li:nth-child(2) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 4, '> ul > li:nth-child(2) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 4, '> ul > li:nth-child(2) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.uncommon.push(drop.part_name);

			// Rare Drops
			item.rare = [];

			drop = {};
			drop.part_name = this.getElementInfo(row_selector + ':nth-child(' + row_number + ') > td:nth-child(5) > ul > li:nth-child(1) > a').text;
			drop.part_name = parsing.Parse_CleanText(drop.part_name);
			drop.item_name = this.GetCellAttribute(row_selector, row_number, 5, '> ul > li:nth-child(1) > a', 'title');
			drop.item_link = this.GetCellAttribute(row_selector, row_number, 5, '> ul > li:nth-child(1) > a', 'href');
			if (!drops[drop.part_name]) { drops[drop.part_name] = drop; }
			item.rare.push(drop.part_name);

			items.push(item);
		}

		// Save to the void-relics.json file.
		Logger.LogDebug('Found [' + items.length + '] Void Relics.');
		Logger.LogDebug('Writing data file [void-relics.json].');
		_WriteDataFile(items, 'void-relics.json');

		// Convert drops to an array and sort it.
		var drop_array = [];
		for (var part_name in drops) {
			if (drops.hasOwnProperty(part_name)) {
				drop_array.push(drops[part_name]);
			}
		}
		drop_array.sort(function(a, b) {
			if (a.part_name < b.part_name)
				return -1;
			if (a.part_name > b.part_name)
				return 1;
			return 0;
		});

		// Save the drop_array to the void-relic-rewards.json file.
		Logger.LogDebug('Found [' + drop_array.length + '] Void Relic Rewards.');
		Logger.LogDebug('Writing data file [void-relic-rewards.json].');
		_WriteDataFile(drop_array, 'void-relic-rewards.json');

	});


//=====================================================================
casper.run(function(self) {
	casper.ExitNow();
});
