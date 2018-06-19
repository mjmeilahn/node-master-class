/* 
* * * * * * * * * * * * * * * * * * * * * * * * *
*   AUTHOR:  MATTHEW J. MEILAHN
*   GITHUB:  https://github.com/mjmeilahn
*   PURPOSE: DOUBLE-CHECK ALL INCOMING DATA
* * * * * * * * * * * * * * * * * * * * * * * * *
*/


// @TODO: List expected param types and returned values

let type = {};



// BASIC TYPE CHECKING

type.boolean = data => {
    return typeof(data) == 'boolean' && data == true ? true : false;
};

type.string = data => {
    return typeof(data) == 'string' && data.trim().length > 0 ? data.trim() : false;
};

type.number = data => {
    return typeof(data) == 'number' && data % 1 === 0 && data >= 1 ? data : false;
};

type.numberHasRange = (min, max, data) => {
    // PROVIDE RANGE TO VALIDATE
    return typeof(data) == 'number' && data % 1 === 0 && data >= min && data <= max ? data : false;
};

type.object = data => {
    return typeof(data) == 'object' && data !== null ? data : {};
};



// CUSTOM TYPE CHECKING

type.phone = data => {
    return typeof(data) == 'string' && data.trim().length == 10 ? data.trim() : false;
};

type.id = data => {
    return typeof(data) == 'string' && data.trim().length == 20 ? data.trim() : false;
};

type.protocol = data => {
    return typeof(data) == 'string' && ['http', 'https'].indexOf(data) > -1 ? data : false;
};

type.http = data => {
    return typeof(data) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data) > -1 ? data : false;
};

type.state = data => {
    return typeof(data) == 'string' && ['up', 'down'].indexOf(data) > -1 ? data : 'down';
};

type.successCodes = data => {
    return typeof(data) == 'object' && data instanceof Array && data.length > 0 ? data : false;
};

type.checks = data => {
    return typeof(data) == 'object' && data instanceof Array && data.length > 0 ? data : [];
};

type.smsMsg = data => {
    return typeof(data) == 'string' && data.trim().length > 0 && data.trim().length <= 1600 ? data.trim() : false;
};

module.exports = type;