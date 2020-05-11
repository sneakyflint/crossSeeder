const rimraf = require('rimraf');

const { checkMatchingMovie, logger, formatRecord, convertIndexerToFileName, delay } = require('./tools');
const { readFromTable, writeToTable, generateSaveObject } = require('./storage');
const { uploadTorrent } = require('./seedbox');
const { getMovieList, getAllIndexers, restoreIndexerSettings, disableAllIndexers, getMovieResults, enableIndexer, saveIndexerSettings } = require('./radarr');
const config = require('../config');



const syncMovies = async () => {
    const indexerList = await getAllIndexers();

    // get all movies that are downloaded
    // format records and only get data we need - records are too big other wise for storage
    const movieList = await getMovieList();
    const records = movieList.records.filter(record => record.downloaded && record.movieFile).map(formatRecord);
    await logger(`${movieList.records.length} movies found and ${records.length} movies ready to process`);

    // filter by black/white lists in config
    const filteredIndexers = indexerList.filter(indexer => {
        if (config.global.blackListIndexers && config.global.blackListIndexers.length && config.global.blackListIndexers.includes(indexer.name)) return false;
        if (config.global.whiteListIndexers && config.global.whiteListIndexers.length && !config.global.whiteListIndexers.includes(indexer.name)) return false;

        return true;
    });

    const indexerNames = filteredIndexers.map(indexer => indexer.name).join(`\n`);
    await logger(`${filteredIndexers.length} matching indexers found:\n ${indexerNames}`);
    await logger(`-----------`);

    for await (const indexer of filteredIndexers) {
        await disableAllIndexers();
        await enableIndexer(indexer);

        const fileName = convertIndexerToFileName(indexer);
        await getMovieTorrents(fileName, records);
    }
    
    await restoreIndexerSettings();
}

/**
 * from a list of movies from radarr get the matching torrents 
 * (by release group) from private torrent sites
 */
async function getMovieTorrents(torrentSite, records){
    
    // keep track of number of added torrents because some sties only allow X amount per day
    let numberOfMatches = 0;

    for await (const record of records) {

        // if torrent was already saved then skip
        const processedTorrent = await readFromTable(record, torrentSite);
        if (processedTorrent) continue;

        // get list of torrents for a movie from the indexer
        await logger(`-----------`);
        await delay();
        const searchResults = await getMovieResults({ movieId: record.id, title: record.title });

        for await (const result of searchResults){

            const matchingTorrent = checkMatchingMovie(result, record);
            if (!matchingTorrent) continue;

            await logger(`match: ${matchingTorrent.title} - ${matchingTorrent.commentUrl}`);
            numberOfMatches++;

            await uploadTorrent(matchingTorrent);
        }

        // save that we have processed the movie record for a torrent site
        await writeToTable(record, torrentSite);
    }

    await logger(`-^- ${numberOfMatches} matches found for ${torrentSite}`);
}

/**
 * on error or SIG exit, restore indexers
 */
function setExitRestoring() {
    process.on('unhandledRejection', async (reason, promise) => {
        console.error(`Uncaught error`, promise, reason);
        await restoreIndexerSettings();
        process.exit(0);
    });
    
    process.on('beforeExit', async () => {
        await restoreIndexerSettings();
        process.exit(0);
    });
}


(async () => {
    const myArgs = process.argv;
    const saveIndexers = myArgs.includes('saveIndexers');
    const restoreIndexers = myArgs.includes('restoreIndexers');

    if (saveIndexers) {
        rimraf.sync(`./indexerSettings.json`);
        await saveIndexerSettings();

    } else if (restoreIndexers) {
        await restoreIndexerSettings();

    } else {
        setExitRestoring();
        await syncMovies();
        
    }
})();