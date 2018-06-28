
// VANILLA NODE DEPENDENCIES
const crypto = require('crypto');
const queryString = require('querystring');
const https = require('https');
const path = require('path');
const fs = require('fs');

// LOCAL FILE DEPENDENCIES
const config = require('./config');
const type = require('./type');



let helpers = {};



// FOR TESTING: RETURN ANY NUMBER
helpers.getANumber = () => {
    return 1;
};


// HASHES A STRING
helpers.hash = str => {
    if (typeof(str) == 'string' && str.length > 0) {
        const hash = crypto
                    .createHmac('sha256', config.hashingSecret)
                    .update(str)
                    .digest('hex');
        return hash;
    } else {
        return false;
    }
};

// PARSE JSON TO OBJECT, WITH TRY-CATCH
// @TODO: remove this helper function and 
// use local validate library I've made instead
helpers.parseJsonToObject = str => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch(e) {
        return {};
    }
}

// CREATE RANDOM STRING OF ALPHANUMERIC CHARACTERS
helpers.createRandomString = strLength => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // DEFINE ALL POSSIBLE CHARACTERS THAT CAN GO INTO STRING
        const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // START FINAL STRING
        let str = '';
        for (let i = 1; i <= strLength; i++) {
            // GET RANDOM CHARACTER FROM STRING VARIABLE
            let randomChar = possibleChars
            .charAt(Math.floor(Math.random() * possibleChars.length));

            // APPEND CHARACTER TO FINAL STRING
            str += randomChar;
        }

        // RETURN STRING
        return str;
    } else {
        return false;
    }
};

// SEND SMS MESSAGE VIA TWILIO
helpers.sendTwilioSms = (phone, msg, callback) => {
    // VALIDATE PHONE
    phone = type.phone(phone);
    // msg = msg.trim().length <= 1600 ? type.string(msg) : false;
    msg = type.smsMsg(msg);
    
    if (phone && msg) {
        // CONFIGURE REQUEST PAYLOAD
        const payload = {
            'From' : config.twilio.fromPhone,
            'To' : '+1' + phone,
            'Body' : msg
        };

        // STRINGIFY PAYLOAD
        const stringPayload = queryString.stringify(payload);

        // CONFIGURE REQUEST DETAILS
        const requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            'auth' : `${config.twilio.accountSid}:${config.twilio.authToken}`,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(stringPayload)
            }
        };

        // INSTANIATE REQUEST OBJECT
        const req = https.request(requestDetails, res => {
            // GRAB STATUS OF REQUEST
            const status = res.statusCode;

            // CALLBACK IF SUCCESS WENT THROUGH
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        // BIND TO ERROR EVENT SO NOTHING IS THROWN
        req.on('error', e => {
            callback(e);
        });

        // ADD THE PAYLOAD
        req.write(stringPayload);

        // END REQUEST / AKA SEND REQUEST
        req.end();
    } else {
        callback('given parameters were missing or invalid');
    }
};


helpers.getTemplate = (name, data, callback) => {
    name = type.string(name);
    data = type.object(data);

    if (name ) {
        const templatesDir = path.join(__dirname, '/../templates/');

        // GET HTML FILE
        fs.readFile(templatesDir + name + '.html', 'utf8', (err, str) => {
            if (!err && str && str.length > 0) {
                const finalString = helpers.interpolate(str, data);
                callback(false, finalString);
            } else {
                callback('No template can be found');
            }
        });
    } else {
        callback('A valid template name was not specified');
    }
};

// ADD UNIVERSAL HEADER/FOOTER TO STRING
helpers.addUniversalTemplate = (str, data, callback) => {
    str = type.string(str);
    data = type.object(data);

    // GET THE HEADER
    helpers.getTemplate('_header', data, (err, headerString) => {
        if (!err && headerString) {
            // GET THE FOOTER
            helpers.getTemplate('_footer', data, (err, footerString) => {
                if (!err && footerString) {
                    // ADD ALL STRINGS TOGETHER
                    const fullString = headerString + str + footerString;
                    callback(false, fullString);
                } else {
                    callback('Could not find footer template');
                }
            });
        } else {
            callback('Could not find the header template');
        }
    });
};

// TAKE GIVEN STRING & DATA OBJECT
// FIND/REPLACE ALL KEYS WITHIN IT
helpers.interpolate = (str, data) => {
    str = type.string(str);
    data = type.object(data);

    // ADD TEMPLATE GLOBALS TO DATA OBJECT...
    // PREPENDING THEIR KEY NAME
    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.'+ keyName] = config.templateGlobals[keyName];
        }
     }

    // FOR EACH KEY IN DATA OBJECT...
    // INSERT ITS VALUE INTO STRING
    for (let key in data) {
        if (data.hasOwnProperty(key) && typeof(data == 'string')) {
            let replace = data[key];
            let find = '{' + key + '}';
            str = str.replace(find, replace);
        }
    }

    return str;
};

// GET CONTENTS OF STATIC/PUBLIC ASSET
helpers.getStaticAsset = (fileName, callback) => {
    fileName = type.string(fileName);

    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/');
        fs.readFile(publicDir + fileName, (err, data) => {
            if (!err && data) {
                callback(false, data);
            } else {
                callback('no file could be found');
            }
        });
    } else {
        callback('A valid file name was not specified');
    }
};

module.exports = helpers;