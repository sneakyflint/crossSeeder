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
    return {
        id: record.id,
        title: record.title,
        source: (record.movieFile.quality.quality.source || '').toLowerCase(),
        videoFormat: (record.movieFile.releaseGroup || '').toLowerCase(),
        relativePath: (record.movieFile.relativePath || '').toLowerCase(),
        gbSize: convertToGB(record.movieFile.size),
        folderName: record.folderName,
    }
}
module.exports.formatRecord = formatRecord;

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

    // skip if result not 1080p
    const hdQuality = /1080/.test(result.quality.quality.name);
    if (!hdQuality) return false;

    // skip if quality mismatch
    const resultQuality = ((result.quality && result.quality.quality.source) || '').toLowerCase();
    if (record.source !== resultQuality) return false;

    // skip if not within X GB in size
    const resultGBSize = convertToGB(result.size);
    if (!equalFloats(resultGBSize, record.gbSize, config.global.sizeThreshold)) return false;

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