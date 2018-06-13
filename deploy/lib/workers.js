
// VANILLA NODE DEPENDENCIES
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');

// LOCAL FILE DEPENDENCIES
const file = require('./file');
const helpers = require('./helpers');
const validate = require('./validate');



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
                        console.log('Error: reading one of the check\'s data');
                    }
                });
            });
        } else {
            console.log('Error: could not find any checks to process');
        }
    });
};

// SANITY CHECK OF /.data/checks DATA
workers.validateCheckData = data => {

    // VALIDATE INCOMING DATA
    data = validate.object(data);
    data.id = validate.id(data.id);
    data.phone = validate.phone(data.phone);
    data.protocol = validate.protocol(data.protocol);
    data.url = validate.string(data.url);
    data.method = validate.http(data.method);
    data.successCodes = validate.successCodes(data.successCodes);
    data.timeoutSeconds = validate.number(1, 5, data.timeoutSeconds);

    // SET KEYS IF BACKGROUND WORKERS MAY HAVE NOT HAVE SET
    data.state = validate.state(data.state);
    data.lastChecked = validate.numberHasValue(data.lastChecked);

    if (data.id && data.phone && data.protocol && data.url && data.method && data.successCodes && data.timeoutSeconds) {
        workers.performCheck(data);
    } else {
        console.log('Error: one of the checks is not properly formatted');
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
        'hostName' : hostName,
        'method' : data.method.toUpperCase(),
        'path' : path + ':80',
        'timeout' : data.timeoutSeconds * 1000
    };

    // INSTANTIATE REQUEST OBJECT (HTTP OR HTTPS)
    const moduleToUse = data.protocol == 'http' ? http : https;

    const req = moduleToUse.request(requestDetails, res => {
        // GET STATUS OF SENT REQUEST
        const status = res.statusCode;
        console.log('got response');

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
        checkOutcome.error = { 'error' : true,'value' : e };
        if (!outcomeSent) {
            console.log('outcome error happened');
            // console.log(e);
            workers.processCheckOutcome(data, checkOutcome);
            outcomeSent = true;
        }
    });

    // BIND TO THE TIMEOUT
    req.on('timeout', e => {
        // UPDATE THE CHECKOUTCOME & PASS DATA
        checkOutcome.error = { 'error' : true,'value' : 'timeout' };
        if (!outcomeSent) {
            console.log('outcome timeout happened');
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

    console.log('workers.js : ' + outcome.responseCode);

    // IF ALERT IS NEEDED
    let alertNeeded = data.lastChecked && data.state !== checkState ? true : false;

    // UPDATE /.data/checks DATA
    let newCheckData = data;
    newCheckData.state = data.state;
    newCheckData.lastChecked = Date.now();

    // SAVE UPDATES
    file.update('checks', newCheckData.id, newCheckData, err => {
        if (!err) {
            if (alertNeeded) {
                workers.alertStatus(newCheckData);
            } else {
                console.log('Check outcome has not changed, no alert needed');
            }
        } else {
            console.log('Error: could not save check updates');
        }
    });
};


workers.alertStatus = data => {
    const msg = `Alert: Your check data for ${data.method.toUpperCase()}- ${data.protocol}://${data.url} is currently ${data.state}`;
    helpers.sendTwilioSms(data.phone, msg, (err, callback) => {
        if (!err) {
            console.log(`Success! User was alerted to a status change in their check via SMS:\n${msg}`);
        } else {
            console.log('Error: could not send SMS alert who had a state change in their check.');
        }
    });
}


workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 2); // ONCE PER 2 SECONDS
};

workers.init = () => {
    // ON APP STARTUP
    workers.gatherAllChecks();

    // CONTINUE BACKGROUND PROCESS
    workers.loop();
};

module.exports = workers;