
// VANILLA NODE DEPENDENCIES
const crypto = require('crypto');

// LOCAL FILE DEPENDENCIES
const config = require('./config');



let helpers = {};

// VALIDATE INCOMING DATA
helpers.validate = (type, data) => {
    switch (type) {
        case 'str':
            return typeof(data) == 'string' && data.trim().length > 0 ? data.trim() : false;
        case 'phone':
            return typeof(data) == 'string' && data.trim().length == 10 ? data.trim() : false;
        case 'bool':
            return typeof(data) == 'boolean' && data == true ? true : false;
        case 'id':
            return typeof(data) == 'string' && data.trim().length == 20 ? data.trim() : false;
        default:
            console.log('form type not specified');
            return false;
    }
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
        const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

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

module.exports = helpers;