

module.exports = {
    radarr: {
        url: 'http://127.0.0.1:7878',
        apiKey: 'xxxxx',
    },
    seedbox: {
        url: 'http://127.0.0.1:8080',
        username: 'admin',
        password: 'adminadmin',
    },
    global: {
        blackListIndexers: [], // dont find cross seeds from these indexers
        whiteListIndexers: [], // ONLY find cross seeds from these indexers
        sizeThreshold: 0.6, // how much smaller or larger a torrent can be to be a 'match' (in GB)
    },
}
