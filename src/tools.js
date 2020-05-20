const config = require('../config');


/** do NOT change the default timeout - this is so the torrent APIs do not get hammered - change at your own risk */
const delay = async (timeout=5000) => new Promise(resolve => setTimeout(resolve, timeout));
module.exports.delay = delay;

module.exports.convertIndexerToFileName = indexer => {
    const fileName = indexer.name.toLowerCase();
    return fileName;
}

/**
 * get only the data we need to compare movie records (radarr) with movie results (jackett)
 * @param {Object} record movie record from radarr
 * @return {Object}
 */
const formatRecord = record => {
    const formattedRecord = {
        id: record.id,
        title: record.title,
        quality: (record.movieFile.quality.quality.name || '').toLowerCase(),
        releaseGroup: (record.movieFile.releaseGroup || '').toLowerCase(),
        relativePath: (record.movieFile.relativePath || '').toLowerCase(),
        gbSize: convertToGB(record.movieFile.size),
        folderName: record.folderName,
    }
    return formattedRecord;
}
module.exports.formatRecord = formatRecord;

module.exports.getFilteredIndexers = indexerList => {
    const filteredIndexers = indexerList.filter(indexer => {
        if (config.global.blackListIndexers && config.global.blackListIndexers.length && config.global.blackListIndexers.includes(indexer.name)) return false;
        if (config.global.whiteListIndexers && config.global.whiteListIndexers.length && !config.global.whiteListIndexers.includes(indexer.name)) return false;
        return true;
    });

    return filteredIndexers;
}

/**
 * convert byte size to GB with 2 decimals
 */
function convertToGB(number) {
    return ((number / 1024 / 1024 / 1024) || 0).toFixed(2);
}
module.exports.convertToGB = convertToGB;

/**
 * compare two float with precision
 */
const equalFloats = (n1, n2, precision=1) =>  {
    return Math.abs(n1 - n2) <= precision;
}

/**
 * find if the movie matches from radarr to the indexer search result
 * @param {Object} result movie result from the indexer
 * @param {Object} record movie record from radarr
 * @param {Object|Boolean} 
 */
module.exports.checkMatchingMovie = function(result, record) {

    // skip if quality mismatch
    const resultQuality = ((result.quality && result.quality.quality && result.quality.quality.name) || '').toLowerCase();
    if (record.quality !== resultQuality) return false;

    // skip if not within X GB in size
    const resultGBSize = convertToGB(result.size);
    if (!equalFloats(resultGBSize, record.gbSize, config.global.sizeThreshold)) return false;

    // if want to compare by release group then do that
    if (config.global.matchByReleaseGroup){
        const resultReleaseGroup = (result.releaseGroup || '').toLowerCase();
        if (resultReleaseGroup !== record.releaseGroup) return false;
    }

    const matchingTorrent = {
        ...record,
        downloadUrl: result.downloadUrl,
        commentUrl: result.commentUrl,
        searchTitle: result.title,
    }

    return matchingTorrent;
}


module.exports.logger = log => {
    process.stdout.write(log);
    process.stdout.write("\n");
}