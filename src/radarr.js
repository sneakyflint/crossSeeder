const querystring = require('querystring');

const { logger } = require('./tools');
const { putData, getData } = require('./fetch');
const { readFromTable, writeAllToTable } = require('./storage');
const config = require('../config');

/**
 * get base radarr path - v2 or v3?
 */
const _getRadarrApiPath = () => {
    return `${config.radarr.url}/api`;
}

/**
 * get a list of movies from radarr that are downloaded already
 */
 const getMovieList = async () => {

     const parameters = querystring.stringify({
         page: 1,
         pageSize: 99999,
         sortKey: 'sortTitle',
         sortDir: 'asc',
         apiKey: config.radarr.apiKey,
     });

    const movieListUrl = `${_getRadarrApiPath()}/movie?${parameters}`;

    const movieList = await getData({ uri: movieListUrl });
    return movieList;
}
module.exports.getMovieList = getMovieList;

function getIndexerUrl(indexerId) {
    const id = indexerId ? `/${indexerId}` : '';

    const parameters = querystring.stringify({ apiKey: config.radarr.apiKey });
    const url = `${_getRadarrApiPath()}/indexer${id}?${parameters}`;

    return url;
}

/**
 * get list of all indexers
 */
async function getAllIndexers() {
    const url = getIndexerUrl();
    const indexerList = await getData({ uri: url });
    return indexerList;
}
module.exports.getAllIndexers = getAllIndexers;

/**
 * enable searching for the given indexer
 * @param {*} indexer 
 */
async function enableIndexer(indexer) {
    await logger(`enabling indexer ${indexer.name}`);
    const indexerUrl = getIndexerUrl(indexer.id);
    await putData({ uri: indexerUrl, body: { ...indexer, enableSearch: true } });
}
module.exports.enableIndexer = enableIndexer;

module.exports.saveIndexerSettings = async function () {
    await logger(`saving all indexer settings`);
    const indexerList = await getAllIndexers();

    for (const indexer of indexerList) {
        writeAllToTable(indexer, 'indexerSettings', 'indexers');
    }

    await logger(`saved all indexer settings`);
}

/**
 * restores all indexer settings
 */
const restoreIndexerSettings = async () => {
    await logger(`restoring all indexer settings`); 
    const indexerList = await getAllIndexers();

    for await (const indexer of indexerList) {
        const originalIndexer = readFromTable(indexer, 'indexerSettings', 'indexers');
        if (!originalIndexer) {
            await logger(`Could not find maching saved indexer: ${indexer.name}`);
            continue;
        }

        const indexerUrl = getIndexerUrl(originalIndexer.id);
        await putData({ uri: indexerUrl, body: originalIndexer });
    }

    await logger(`restored all indexer settings`); 
}
module.exports.restoreIndexerSettings = restoreIndexerSettings;

/**
 * gets all indexers and disables the ones that are enabled
 */
async function disableAllIndexers() {
    await logger(`disabling all indexers`);

    const indexerList = await getAllIndexers();

    for await (const indexer of indexerList) {
        if (!indexer.enableSearch) continue;

        const indexerUrl = getIndexerUrl(indexer.id);
        await putData({ uri: indexerUrl, body: { ...indexer, enableSearch: false } });
    }
}
module.exports.disableAllIndexers = disableAllIndexers;


/**
 * get list of torrents from radarr
 */
async function getMovieResults({ movieId, title }) {
    await logger(`finding: ${title}`);

    const parameters = querystring.stringify({
        movieId,
        apiKey: config.radarr.apiKey,
    });

    const searchUrl = `${_getRadarrApiPath()}/release?${parameters}`;
    let searchResults = await getData({ uri: searchUrl });
    await logger(`${searchResults.length} results found`);

    return searchResults;
}
module.exports.getMovieResults = getMovieResults;