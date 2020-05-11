const rp = require('request-promise');

const { delay } = require('./tools');
 
/**
 * gets data from a uri
 * @param {Object} parameters 
 */
module.exports.getData = async function getData(parameters) {
    try {
        // console.log(parameters);
        return await rp({ json: true, timeout: 10000000, ...parameters });
    } catch(e) {
        await delay();
        try {
            // console.log(parameters);
            return await rp({ json: true, timeout: 10000000, ...parameters });
        } catch(e) {
            await console.log(e);
            process.exit();
        }
    }
}

/**
 * post data to a uri
 * @param {Object} parameters 
 */
module.exports.postData = async function postData(parameters) {
    try {
        // console.log(parameters);
        return await rp.post({ json: true, timeout: 10000000, ...parameters });
    } catch (e) {
        await delay();
        try {
            // console.log(parameters);
            return await rp.post({ json: true, timeout: 10000000, ...parameters });
        } catch (e) {
            await console.log(e);
            process.exit();
        }
    }
}

/**
 * put data to a uri
 * @param {Object} parameters 
 */
module.exports.putData = async function postData(parameters) {
    try {
        // console.log(parameters);
        return await rp.put({ json: true, timeout: 10000000, ...parameters });
    } catch (e) {
        await delay();
        try {
            // console.log(parameters);
            return await rp.put({ json: true, timeout: 10000000, ...parameters });
        } catch (e) {
            await console.log(e);
            process.exit();
        }
    }
}