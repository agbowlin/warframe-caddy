//=====================================================================
//=====================================================================
//
//	tennodrops.scrape.js
//
//	Scrapes the website at http://tennodrops.com
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

// var JQuery_js_Filename = 'node_modules/jquery/dist/jquery.min.js';
// var Client_js_Filename = 'casper-get-datatable-data.js';

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
Logger.Config.group = 'tennodrops.scrape';
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
// Logger.LogDebug("Casper CLI passed args:", casper.cli.args);
// Logger.LogDebug("Casper CLI passed options:", casper.cli.options);


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
casper.GetCellText = function GetCellText(TableRowSelector, RowNumber, CellNumber, InternalSelector) {
	InternalSelector = InternalSelector || '';
	var text = this.getElementInfo(TableRowSelector + ':nth-child(' + RowNumber + ') > td:nth-child(' + CellNumber + ') ' + InternalSelector).text;
	text = parsing.Parse_CleanText(text);
	return text;
};


//=====================================================================
function _WriteDataFile(Data, Filename) {
	var data_filename = casper_fs.join('tennodrops.data', Filename);
	var content = JSON.stringify(Data, undefined, 4);
	casper_fs.write(data_filename, content, 'w');
	return;
}

/* global jQuery */

//=====================================================================
//
//		Tennodrops
//
casper.thenOpen('http://tennodrops.com',
	function() {
		Logger.LogDebug('Loaded [' + this.getCurrentUrl() + '].');

		var item_rows = [];

		//---------------------------------------------------------------------
		// Parts
		//---------------------------------------------------------------------

		// Get the data from the page.
		item_rows = this.evaluate(function() {
			var datatable_data = jQuery('#tablepress-1').DataTable().data();
			var rows = [];
			datatable_data.each(function(row) {
				rows.push(row);
			});
			return rows;
		});
		Logger.LogDebug('Found [' + item_rows.length + '] parts table rows.');
		Logger.LogDebug('Writing data file [parts-table.json].');
		_WriteDataFile(item_rows, 'parts-table.json');

		// Copy the data from a table to an associative array.
		var part_items = [];
		for (var index = 0; index < item_rows.length; index++) {
			var part_item = {};
			part_item.item_type = item_rows[index][0];
			part_item.item_name = item_rows[index][1];
			part_item.part_type = item_rows[index][2];
			part_item.part_name = part_item.item_name + ' ' + part_item.part_type;
			if (((part_item.item_type == 'Warframe') || (part_item.item_type == 'Archwing')) &&
				(part_item.part_type != 'Blueprint')) {
				part_item.part_name = part_item.part_name + ' Blueprint';
			}
			part_item.part_source = item_rows[index][3];
			if (parsing.Parse_TextStartsWith(part_item.part_source, '<a ', true)) {
				part_item.part_source = parsing.Parse_GetTextBetween(part_item.part_source, '>', '<', true);
			}
			if( item_rows[index][4])
			{
				part_item.part_source += ' (' + item_rows[index][4] + ')';
			}
			part_item.part_ducat_value = item_rows[index][5];
			// Check for duplicate part item.
			if(part_items[part_item.part_name])
			{
				part_items[part_item.part_name].part_source += ', ' + part_item.part_source;
			}
			else
			{
				part_items[part_item.part_name] = part_item;
			}
		}

		// Copy the data from an associative array to an ordered array.
		var item_array = [];
		for (var part_name in part_items) {
			if (part_items.hasOwnProperty(part_name)) {
				item_array.push(part_items[part_name]);
			}
		}
		
		// Sort the ordered array.
		item_array.sort(function(a, b) {
			if (a.part_name < b.part_name)
				return -1;
			if (a.part_name > b.part_name)
				return 1;
			return 0;
		});

		// Write ordered array to file.
		Logger.LogDebug('Found [' + item_array.length + '] part items.');
		Logger.LogDebug('Writing data file [parts.json].');
		_WriteDataFile(item_array, 'parts.json');

		//---------------------------------------------------------------------
		// Mods
		//---------------------------------------------------------------------

		// Get the data from the page.
		item_rows = this.evaluate(function() {
			var datatable_data = jQuery('#tablepress-2').DataTable().data();
			var rows = [];
			datatable_data.each(function(row) {
				rows.push(row);
			});
			return rows;
		});
		Logger.LogDebug('Found [' + item_rows.length + '] mod table rows.');
		Logger.LogDebug('Writing data file [mods-table.json].');
		_WriteDataFile(item_rows, 'mods-table.json');

		// Copy the data from a table to an ordered array.
		var mod_items = [];
		for (var index = 0; index < item_rows.length; index++) {
			var mod_item = {};
			mod_item.mod_name = item_rows[index][1];
			mod_item.mod_source = item_rows[index][2];
			// mod_item.mod_polarity = item_rows[index][3];
			mod_item.mod_rarity = item_rows[index][4];
			mod_item.mod_applies_to = item_rows[index][5];
			mod_item.mod_description = item_rows[index][6];
			// mod_item.mod_wikia_link = item_rows[index][7];
			mod_item.mod_transmutability = item_rows[index][8];
			mod_items.push(mod_item);
		}
		
		// Write ordered array to file.
		Logger.LogDebug('Found [' + mod_items.length + '] mod items.');
		Logger.LogDebug('Writing data file [mods.json].');
		_WriteDataFile(mod_items, 'mods.json');

	});


//=====================================================================
casper.run(function(self) {
	casper.ExitNow();
});
