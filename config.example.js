

module.exports = {
    radarr: {
        baseUrl: '',
        apiKey: '',
        apiPath: 'api',
        movie: {
            urlPath: 'movie',
            query: {
                page: 1,
                pageSize: 99999,
                sortKey: 'sortTitle',
                sortDir: 'asc',
            }
        },
        release: {
            urlPath: 'release',
            query: {
                movieId: 0,
                sort_by: 'releaseWeight',
                order: 'asc',
            }
        },
        indexers: {
            urlPath: 'indexer',
        },
    },
    seedbox: {
        username: '',
        password: '',
        baseUrl: '',
        apiPath: 'api/v2',
    },
    global: {
        dbTable: 'torrents',
        timestampFormat: 'MM/DD/YY hh:mma',
        uploadFile: '_uploader',
        skipIndexers: [],
    },
}
