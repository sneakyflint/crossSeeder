const rp = require('request-promise');
const querystring = require('querystring');

const { postData } = require('./fetch');
const config = require('../config');


let _jar = null; 
async function getCookieJar() {
    if (_jar) return _jar;

    // if not jar then we need to create one and login to have session cookies
    _jar = rp.jar();

    await postData({
        url: `${settings.baseUrl}/${settings.apiPath}/auth/login`,
        jar: _jar,
        form: {
            username: settings.username,
            password: settings.password
        }
    });

    return _jar;
}

/**
 * upload torrent
 */
module.exports.uploadTorrent = async (torrent, torrentClient) => {

    // allow for other torrent clients here
    if (torrentClient) {

    } else {
        await uploadQbittorrent(torrent);
    }
}

/**
 * upload torent to a qbittorrent client
 * @param {Object} torrent 
 */
const uploadQbittorrent = async torrent => {
    const formData = {
        paused: 'true',
        autoTMM: 'false',
        root_folder: 'false',
        urls: torrent.downloadUrl,
        savepath: torrent.folderName,
    };

    const response = await postData({
        url: `${settings.baseUrl}/${settings.apiPath}/torrents/add`,
        jar: await getCookieJar(),
        headers: { 'Content-Type': 'multipart/form-data' },
        formData
    });

    if (!/ok/i.test(response)) throw new Error(response);
}
