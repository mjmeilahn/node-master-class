/* 
* * * * * * * * * * * * * * * * * * * * * * * * *
*   AUTHOR:  MATTHEW J. MEILAHN
*   GITHUB:  https://github.com/mjmeilahn
*   PURPOSE: DOUBLE-CHECK ALL INCOMING DATA
* * * * * * * * * * * * * * * * * * * * * * * * *
*/


// @TODO: List expected param types and returned values

let validate = {};



// BASIC TYPE CHECKING

validate.boolean = data => {
    return typeof(data) == 'boolean' && data == true ? true : false;
};

validate.string = data => {
    return typeof(data) == 'string' && data.trim().length > 0 ? data.trim() : false;
};

validate.numberHasValue = data => {
    return typeof(data) == 'number' && data % 1 === 0 && data >= 1 ? data : false;
};

validate.number = (min, max, data) => {
    // PROVIDE RANGE TO VALIDATE
    return typeof(data) == 'number' && data % 1 === 0 && data >= min && data <= max ? data : false;
};

validate.object = data => {
    return typeof(data) == 'object' && data !== null ? data : {};
};



// CUSTOM TYPE CHECKING

validate.phone = data => {
    return typeof(data) == 'string' && data.trim().length == 10 ? data.trim() : false;
};

validate.id = data => {
    return typeof(data) == 'string' && data.trim().length == 20 ? data.trim() : false;
};

validate.protocol = data => {
    return typeof(data) == 'string' && ['http', 'https'].indexOf(data) > -1 ? data : false;
};

validate.http = data => {
    return typeof(data) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data) > -1 ? data : false;
};

validate.state = data => {
    return typeof(data) == 'string' && ['up', 'down'].indexOf(data) > -1 ? data : 'down';
};

validate.successCodes = data => {
    return typeof(data) == 'object' && data instanceof Array && data.length > 0 ? data : false;
};

validate.checks = data => {
    return typeof(data) == 'object' && data instanceof Array && data.length > 0 ? data : [];
};

validate.smsMsg = data => {
    return typeof(data) == 'string' && data.trim().length > 0 && data.trim().length <= 1600 ? data.trim() : false;
};

module.exports = validate;