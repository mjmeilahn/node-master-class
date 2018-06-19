
// VANILLA NODE DEPENDENCIES
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const util = require('util');

// CONDITIONALLY SHOW CONSOLE.LOGS WITH NODE_DEBUG=workers
const debug = util.debuglog('workers');

// LOCAL FILE DEPENDENCIES
const file = require('./file');
const helpers = require('./helpers');
const type = require('./type');
const logs = require('./logs');



let workers = {};

// LOOK UP ALL CHECKS, THEIR DATA, AND SEND TO VALIDATOR
workers.gatherAllChecks = () => {
    file.list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                file.read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        workers.validateCheckData(originalCheckData);
                    } else {
                        debug('Error: reading one of the check\'s data');
                    }
                });
            });
        } else {
            debug('Error: could not find any checks to process');
        }
    });
};

// SANITY CHECK OF /.data/checks DATA
workers.validateCheckData = data => {

    // VALIDATE INCOMING DATA
    data = type.object(data);
    data.id = type.id(data.id);
    data.phone = type.phone(data.phone);
    data.protocol = type.protocol(data.protocol);
    data.url = type.string(data.url);
    data.method = type.http(data.method);
    data.successCodes = type.successCodes(data.successCodes);
    data.timeoutSeconds = type.number(data.timeoutSeconds);

    // SET KEYS IF BACKGROUND WORKERS MAY HAVE NOT HAVE SET
    data.state = type.state(data.state);
    data.lastChecked = type.number(data.lastChecked);

    if (data.id && data.phone && data.protocol && data.url && data.method && data.successCodes && data.timeoutSeconds) {
        workers.performCheck(data);
    } else {
        debug('Error: one of the checks is not properly formatted');
    }
};

workers.performCheck = data => {
    // PREPARE INITIAL STATE
    let checkOutcome = {
        'error' : false,
        'responseCode' : false
    };

    let outcomeSent = false;

    // PARSE HOSTNAME & PATH FROM ORIGINAL CHECK DATA
    const parsedUrl = url.parse(data.protocol + '://' + data.url, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path; // USE "PATH" TO GET FULL QUERY STRING

    const requestDetails = {
        'protocol' : data.protocol + ':',
        'hostname' : hostName,
        'method' : data.method.toUpperCase(),
        'path' : path,
        'timeout' : data.timeoutSeconds * 1000
    };

    // INSTANTIATE REQUEST OBJECT (HTTP OR HTTPS)
    const moduleToUse = data.protocol == 'http' ? http : https;

    const req = moduleToUse.request(requestDetails, res => {
        // GET STATUS OF SENT REQUEST
        const status = res.statusCode;

        // UPDATE CHECKOUTCOME & PASS DATA
        checkOutcome.responseCode = status;

        if (!outcomeSent) {
            workers.processCheckOutcome(data, checkOutcome);
            outcomeSent = true;
        }
    });

    // BIND TO ERROR EVENT SO SINGLE-THREAD IS NOT THROWN
    req.on('error', e => {
        // UPDATE THE CHECKOUTCOME & PASS DATA
        checkOutcome.error = { 'error' : true, 'value' : e };
        if (!outcomeSent) {
            debug('outcome error happened');
            // debug(e);
            workers.processCheckOutcome(data, checkOutcome);
            outcomeSent = true;
        }
    });

    // BIND TO THE TIMEOUT
    req.on('timeout', e => {
        // UPDATE THE CHECKOUTCOME & PASS DATA
        checkOutcome.error = { 'error' : true, 'value' : 'timeout' };
        if (!outcomeSent) {
            debug('outcome timeout happened');
            workers.processCheckOutcome(data, checkOutcome);
            outcomeSent = true;
        }
    });

    // SEND REQUEST
    req.end();
};

workers.processCheckOutcome = (data, outcome) => {
    // GET INITIAL STATE
    const checkState = !outcome.error && outcome.responseCode && data.successCodes.indexOf(outcome.responseCode) > -1 ? 'up' : 'down';

    // IF ALERT IS NEEDED
    const alertNeeded = data.lastChecked && data.state !== checkState ? true : false;
    const timeOfCheck = Date.now();

    // LOG THE OUTCOME
    workers.log(data, outcome, checkState, alertNeeded, timeOfCheck);

    // UPDATE /.data/checks DATA
    let newCheckData = data;
    newCheckData.state = checkState;
    newCheckData.lastChecked = timeOfCheck;

    // SAVE UPDATES
    file.update('checks', newCheckData.id, newCheckData, err => {
        if (!err) {
            if (alertNeeded) {
                workers.alertStatus(newCheckData);
            } else {
                debug('Check outcome has not changed, no alert needed');
            }
        } else {
            debug('Error: could not save check updates');
        }
    });
};


workers.alertStatus = data => {
    const msg = `Alert: Your check data for ${data.method.toUpperCase()}- ${data.protocol}://${data.url} is currently ${data.state}`;
    helpers.sendTwilioSms(data.phone, msg, (err, callback) => {
        if (!err) {
            debug(`Success! User was alerted to a status change in their check via SMS:\n${msg}`);
        } else {
            debug('Error: could not send SMS alert who had a state change in their check.');
        }
    });
}

workers.log = (data, outcome, state, alertNeeded, timeOfCheck) => {
    // FORMAT LOG DATA
    const logData = {
        'check' : data,
        'outcome' : outcome,
        'state' : state,
        'alert' : alertNeeded,
        'time' : timeOfCheck
    };

    // CONVERT TO JSON STRING
    const logString = JSON.stringify(logData);

    // CREATE FILE NAME
    const logFileName = data.id;

    // APPEND LOG STRING TO FILE
    logs.append(logFileName, logString, err => {
        if (!err) {
            debug('SUCCESS: Logging to file');
        } else {
            debug('ERROR: Logging failed');
        }
    });
};

// TIMER TO RUN WORKERS ONCE PER MINUTE
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// ROTATE / COMPRESS THE LOG FILES
workers.rotateLogs = () => {
    // LIST ALL NON-COMPRESSED LOGS
    logs.list(false, (err, allLogs) => {
        if (!err && allLogs) {
            allLogs.forEach(logName => {
                // COMPARE LOG DATA TO ANOTHER FILE
                const logID = logName.replace('.log', '');
                const newLogID = logID + '-' + Date.now();
                logs.compress(logID, newLogID, err => {
                    if (!err) {
                        // TRUNCATE THE LOG
                        logs.truncate(logID, err => {
                            if (!err) {
                                debug('Success truncating log file');
                            } else {
                                debug('Error truncating log file');
                            }
                        });
                    } else {
                        debug('Error compressing one of log files', err);
                    }
                });
            });
        } else {
            debug('Error: could not find logs to rotate');
        }
    });
};

// TIMER TO RUN LOG ROTATION ONCE PER DAY
workers.logRotationLoop = () => {
    setInterval(() => {
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};

workers.init = () => {

    // SEND TO CONSOLE IN YELLOW
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    // ON APP STARTUP
    workers.gatherAllChecks();

    // CONTINUE BACKGROUND PROCESS
    workers.loop();

    // COMPRESS ALL LOGS
    workers.rotateLogs();

    // CALL COMPRESSION LOOP
    // SO LOGS WILL EVENTUALLY BE COMPRESSED
    workers.logRotationLoop();
};

module.exports = workers;