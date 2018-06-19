
// VANILLA NODE DEPENDENCIES
const crypto = require('crypto');
const queryString = require('querystring');
const https = require('https');

// LOCAL FILE DEPENDENCIES
const config = require('./config');
const type = require('./type');



let helpers = {};

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

module.exports = helpers;