
// LIBRARY FOR STORING & ROTATING LOGS/GZIP FILES

// @TODO: Refactor callbacks into Promise pattern

// VANILLA NODE DEPENDENCIES
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

let lib = {};

// BASE DIRECTORY FOR LOGS
lib.baseDir = path.join(__dirname, '/../.logs/');


// APPEND STRING TO FILE
// CREATE FILE IF IT DOES NOT EXIST
lib.append = (file, str, callback) => {
    // OPEN THE FILE
    fs.open(lib.baseDir + file + '.log', 'a', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // APPEND TO FILE & CLOSE IT
            fs.appendFile(fileDescriptor, str + '\n', err => {
                if (!err) {
                    fs.close(fileDescriptor, err => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing appended file');
                        }
                    });
                } else {
                    callback('Error appending to file');
                }
            });
        } else {
            callback('could not open file for appending');
        }
    });
};



// LIST ALL LOGS, OPTIONALLY INCLUDE COMPRESSED LOGS
lib.list = (includeCompressedLogs, callback) => {
    fs.readdir(lib.baseDir, (err, data) => {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach(fileName => {
                // ADD THE .log FILES
                if (fileName.indexOf('.log') > -1) {
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }

                // ADD THE .gz FILES
                if (fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs) {
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });

            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};


// COMPRESS CONTENTS OF .log FILE INTO .gz.b64 FILE IN SAME FOLDER
lib.compress = (logID, newFileID, callback) => {
    const source = logID + '.log';
    const destination = newFileID + '.gz.b64';

    // READ THE SOURCE FILE
    fs.readFile(lib.baseDir + source, 'utf8', (err, inputString) => {
        if (!err && inputString) {
            // COMPRESS DATA USING GZIP
            zlib.gzip(inputString, (err, buffer) => {
                if (!err && buffer) {
                    // SEND DATA TO DESTINATION FILE
                    fs.open(lib.baseDir + destination, 'wx', (err, fileDescriptor) => {
                        if (!err && fileDescriptor) {
                            // WRITE TO DESTINATION FILE
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), err => {
                                if (!err) {
                                    // CLOSE DESTINATION FILE
                                    fs.close(fileDescriptor, err => {
                                        if (!err) {
                                            callback(false);
                                        } else {
                                            callback(err);
                                        }
                                    });
                                } else {
                                    callback(err);
                                }
                            });
                        } else {
                            callback(err);
                        }
                    });
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};


// DECOMPRESS THE CONTENTS OF .gz.b64 FILE INTO STRING
lib.decompress = (fileId, callback) => {
    const fileName = fileId + '.gz.b64';

    fs.readFile(lib.baseDir + fileName, 'utf8', (err, str) => {
        if (!err && str) {
            // DECOMPRESS DATA
            let inputBuffer = Buffer.from(str, 'base64');
            zlib.unzip(inputBuffer, (err, outputBuffer) => {
                if (!err && outputBuffer) {
                    const output = outputBuffer.toString();
                    callback(false, output);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(err);
        }
    });
};

lib.truncate = (logID, callback) => {
    fs.truncate(lib.baseDir + logID + '.log', 0, err => {
        if (!err) {
            callback(false);
        } else {
            callback(err);
        }
    });
};

module.exports = lib;