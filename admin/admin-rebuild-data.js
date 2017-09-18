//=====================================================================
//=====================================================================
//
//		admin-rebuild-data.js
//
//=====================================================================
//=====================================================================


//=====================================================================
// Includes

var npm_process = require('process');
var npm_fs = require('fs');


//=====================================================================
function CopyFile( SourceFilename, TargetFilename )
{
	console.log('Copy from [' + SourceFilename + '] to [' + TargetFilename + '].');
	var file_content = npm_fs.readFileSync(SourceFilename);
	npm_fs.writeFileSync(TargetFilename, file_content);
	return;
}


var target_data_path = '../data';


//=====================================================================
// Migrate data from warframe.wikia.scrape

var warframe_wikia_scrape_data_path = '../../warframe.wikia.scrape/data';

CopyFile( warframe_wikia_scrape_data_path + '/void-relics.json', target_data_path + '/void-relics.json');
CopyFile( warframe_wikia_scrape_data_path + '/warframes.json', target_data_path + '/warframes.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-archwing-melee.json', target_data_path + '/weapons-archwing-melee.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-archwing-primary.json', target_data_path + '/weapons-archwing-primary.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-melee.json', target_data_path + '/weapons-melee.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-primary.json', target_data_path + '/weapons-primary.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-secondary.json', target_data_path + '/weapons-secondary.json');
CopyFile( warframe_wikia_scrape_data_path + '/weapons-sentinel.json', target_data_path + '/weapons-sentinel.json');


//=====================================================================
// Generate list of Void Relic Rewards



//=====================================================================
// Migrate data from warframe.market.items

var warframe_market_items_data_path = '../../warframe.market.items/warframe.market-items/items';

// var file_content = npm_fs.readFileSync(source_filename);
// var file_data = JSON.parse(file_content);
// console.log(JSON.stringify(file_data, null, 4));


//=====================================================================
// Exit

npm_process.exit(0);
