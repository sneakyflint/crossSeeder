## Cross Seeder

This program will use Radarr to find movies currently downloaded and search through each of your indexers setup in radarr for similar matching torrents. It does this by looking at the torrent sizes and adding torrent close to your downloaded torrent size. Afterwards, youcan review the torrent added to rename, delete, or start torrent found.

This program will find all your indexers and save the current settings as it disables them one by one when checking. You first need to make sure to save your indexer settings by running `npm run save` BEFORE running `npm start`. The program will attempt to restore your saved indexer setings but if for some reason it doesn't you can restore them manually with `npm run restore`.

NOTE: Run this program at your own risk. It wiull not delte any files but does change your indexer settings so be sure to back them up in Radarr before running this program.

## Installation

* Requires `node.js` v8 or above
* Run `npm install`
* copy the `config.example.js` file to `config.js`
* add your radarr url and api key
* add your qBitorrent username, password, and url
  
## Usage
* Run `npm run save` to save you current indexer setings
* Run `npm start` to start cross seeder
* Run `npm run restore` to restore indexer settingsd saved from `npm run save`