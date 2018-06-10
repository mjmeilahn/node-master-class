
// VANILLA NODE DEPENDENCIES
const crypto = require('crypto');

// LOCAL FILE DEPENDENCIES
const config = require('./config');



let helpers = {};

// VALIDATE FORM DATA
helpers.validate = (type, data) => {
    switch (type) {
        case 'str':
            return (typeof(data) == 'string' && data.trim().length > 0) ? data.trim() : false;
        case 'phone':
            return (typeof(data) == 'string' && data.trim().length == 10) ? data.trim() : false;
        case 'bool':
            return (typeof(data) == 'boolean' && data == true) ? true : false;
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

module.exports = helpers;