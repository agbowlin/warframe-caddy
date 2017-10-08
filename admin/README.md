

Warframe Caddy :: Admin
=====================================================================


(1) Scrape Gear Data from the Warframe Wikia
---------------------------------------------------------------------

Run the CasperJS script:
```
casperjs 1.warframe.wikia.scrape-index.js
```

Scrapes the website at http://warframe.wikia.com
and stores the scraped data in json files located
in a subfolder.

##### A. Scrape Warframe Data

- Navigate to: [http://warframe.wikia.com/wiki/Warframes_Comparison](http://warframe.wikia.com/wiki/Warframes_Comparison)
- Scrape all common and prime warframes.
- Build objects with the following schema:

	- Warframes
		- `name`
		- `link`
		- `health`
		- `shields`
		- `energy`
		- `armor`
		- `sprint`

- Generates files:
	- `warframes.json`


##### B. Scrape Weapons Data

- Navigate to: [http://warframe.wikia.com/wiki/Weapon_Comparison](http://warframe.wikia.com/wiki/Weapon_Comparison)
- Scrape all weapons.
- Build objects with the following schema:

	- Primary Weapons, Secondary Weapons, Sentinel Weapons, Archwing Primary Weapons
		- `name`
		- `link`
		- `trigger_type`
		- `damage`
		- `critical_chance`
		- `critical_damage`
		- `status_chance`
		- `projectile_type`
		- `fire_rate`
		- `magazine_size`
		- `reload_time`
		- `mastery_rank`

	- Melee Weapons, Archwing Melee Weapons
		- `name`
		- `link`
		- `type`
		- `damage`
		- `slide`
		- `attack_speed`
		- `critical_chance`
		- `critical_damage`
		- `status_chance`
		- `mastery_rank`

- Generates files:
	- `weapons-primary.json`
	- `weapons-secondary.json`
	- `weapons-melee.json`
	- `weapons-sentinel.json`
	- `weapons-archwing-primary.json`
	- `weapons-archwing-melee.json`


##### C. Scrape Void Relic and Drop Data

- Navigate to: [http://warframe.wikia.com/wiki/Void_Relic](http://warframe.wikia.com/wiki/Void_Relic)
- Scrape all weapons.
- Build objects with the following schema:

	- Relics
		- `tier`
		- `type`
		- `common`: [] of Drop
		- `uncommon`: [] of Drop
		- `rare`: [] of Drop

	- Drops
		- `part_name`
		- `item_name`
		- `item_link`

- Generates files:
	- `void-relic-rewards.json`


(2) Clone Data from the Warframe Market
---------------------------------------------------------------------

Update data from Mercurial repository:
```
rm -r warframe.market-items
hg clone https://bitbucket.org/42bytes/warframe.market-items
```


(3) Analyze Data and Generate Working Dataset
---------------------------------------------------------------------

Run the NodeJS script:
```
node 3.generate-indexes.js
```

Reads the data from steps (1) and (2) above and merges them together
into a single data file.

```
3.generate-indexes.js

  Compile data sources and generate data files for the warframe-caddy server. 

Synopsis

  $ node 3.generate-indexes.js <options> 

Options

  -p, --production boolean   Run in production mode. This will overwrite distribution files in production. 
  -a, --archive boolean      Archive the compiled data to the history folder.                              
  -l, --logflags flags       The logging flags to use for console output. Can be any combination of        
                             "TDIWEF". Defualt is "IWEF".                                                  
  -h, --help                 Print this help.                                                              
```


