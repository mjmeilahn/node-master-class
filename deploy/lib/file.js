
// VANILLA NODE DEPENDENCIES
const fs = require('fs');
const path = require('path');

// LOCAL FILE DEPENDENCIES
const helpers = require('./helpers');

let lib = {};



// DEFINE BASE DIR FOR /.data
lib.baseDir = path.join(__dirname, '/../.data/');
// console.log(lib.baseDir);

// WRITE DATA TO A FILE
lib.create = (dir, file, data, callback) => {

    // OPEN THE FILE FOR WRITING
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {

        /*
        * @TODO: Refactor nested callbacks into Promises
        */

        if (!err && fileDescriptor) {
            // CONVERT DATA TO STRING
            let stringData = JSON.stringify(data);

            // WRITE TO FILE & CLOSE IT
            fs.writeFile(fileDescriptor, stringData, err => {
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('error closing new file');
                        }
                    });
                } else {
                    callback('error writing to new file');
                }
            });

        } else {
            callback('could not create new file, it may already exist');
        }
    });
};

// READ DATA FROM FILE
lib.read = (dir, file, callback) => {
    // console.log(lib.baseDir + dir + '/' + file + '.json');
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
};

// UPDATE DATA FROM EXISTING FILE
lib.update = (dir, file, data, callback) => {

    // OPEN FILE FOR WRITING
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {

        /*
        * @TODO: Refactor nested callbacks into Promises
        */

        if (!err && fileDescriptor) {
            // CONVERT DATA TO STRING
            let stringData = JSON.stringify(data);

            // TRUNCATE THE FILE
            fs.truncate(fileDescriptor, err => {
                if (!err) {
                    // WRITE TO FILE & CLOSE IT
                    fs.writeFile(fileDescriptor, stringData, err => {
                        if (!err) {
                            fs.close(fileDescriptor, err => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('error closing file.');
                                }
                            });
                        } else {
                            callback('error writing to existing file.');
                        }
                    })
                } else {
                    callback('error truncating file.');
                }
            });
        } else {
            callback('could not open the file for updating, it may not exist yet.');
        }
    });
};

lib.delete = (dir, file, callback) => {
    // UNLINK THE FILE
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', err => {
        (!err) ? callback(false) : callback('error deleting file.');
    });
};

// EXPORT MODULE
module.exports = lib;