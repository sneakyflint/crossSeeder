const FileSync = require('lowdb/adapters/FileSync');
const low = require('lowdb');
const moment = require('moment');

const config = require('../config');

let _db = null;
let _table = null;
let _fileName = null;

const dbTable = 'torrents';
const timestampFormat = 'MM/DD/YY hh:mma';

/**
 * return a db table
 */

function _getTable(fileName, table = dbTable) {
    if (!fileName) throw new Error('No fileName given for db file');

    // if we want the same db as before then just return it
    // so we dont keep opening the same file and possibly corrupting it
    if (_fileName === fileName && _table === table) return _table;
    _fileName = fileName;

    const adapter = new FileSync(`src/stores/${fileName}.json`);
    _db = low(adapter);

    _db.defaults({ [table]: [] }).write();
    _table = _db.get(table);

    return _table;
}

/**
 * return raw object of a found record
 */
const _readRawFromTable = (findBy, fileName, table) => {
    const tableRecord = _getTable(fileName, table);
    const dbRecord = tableRecord.find(findBy);
    return dbRecord;
}

/**
 * create a timestamp
 */
const _createTimeStamp = () => moment(new Date()).format(timestampFormat);

/**
 * allw to write multiple records to db
 */
const writeAllToTable = (data, fileName, table) => {
    const tableRecord = _getTable(fileName, table);
    const _writeTime = _createTimeStamp();

    if (Array.isArray(data)) return tableRecord.push(...data, _writeTime).write();
    return tableRecord.push({ ...data, _writeTime }).write();
}
module.exports.writeAllToTable = writeAllToTable;

/**
 * generates object to search for in db
 */
const _generateSearchQuery = function (data) {
    let findBy = { id: data.id };
    return findBy;
}

/**
 * write a single record to the db
 */
const writeToTable = (data, fileName, table) => {
    const tableRecord = _getTable(fileName, table);

    data._writeTime = _createTimeStamp();
    return tableRecord.push(data).write();
}
module.exports.writeToTable = writeToTable;

/**
 * return plain json object of a found record
 */
const readFromTable = (data, fileName, table) => {
    const findBy = _generateSearchQuery(data);
    const dbRecord = _readRawFromTable(findBy, fileName, table).value();
    return dbRecord;
}
module.exports.readFromTable = readFromTable;

/**
 * generates object to save
 */
function generateSaveObject({data, siteName, processed, generated, uploaded}) {
    let recordToSave = {
        id: data.id,
        title: data.title,
        _writeTime: _createTimeStamp(),
    };

    return recordToSave;
}
module.exports.generateSaveObject = generateSaveObject;