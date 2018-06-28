

// API TESTS



// VANILLA NODE DEPENDENCIES
const assert = require('assert');
const http = require('http');

// LOCAL FILE DEPENDENCIES
const app = require('./../index');
const config = require('./../lib/config');


// CONTAINER FOR TESTS
let api = {};

// API HELPERS
let apiHelpers = {};

apiHelpers.makeGetRequest = (path, callback) => {
    // CONFIGURE REQUEST DETAILS
    const requestDetails = {
        'protocol' : 'http:',
        'hostname' : 'localhost',
        'port' : config.httpPort,
        'method' : 'GET',
        'path' : path,
        'headers' : {
            'Content-Type' : 'application/json'
        }
    };

    const req = http.request(requestDetails, res => {
        callback(res);
    });

    // SEND REQUEST
    req.end();
};

// THE MAIN .init() SHOULD RUN WITHOUT THROWING
api['app init should start without throwing'] = done => {
    assert.doesNotThrow(() => {
        app.init(err => {
            done();
        });
    }, TypeError);
};


// MAKE REQUEST TO /ping
api['/ping should respond to GET with 200'] = done => {
    apiHelpers.makeGetRequest('/ping', res => {
        assert.equal(res.statusCode, 200);
        done();
    });
};


// MAKE REQUEST TO /api/users
api['/api/users should respond to GET with 400'] = done => {
    apiHelpers.makeGetRequest('/api/users', res => {
        assert.equal(res.statusCode, 400);
        done();
    });
};


// MAKE REQUEST TO RANDOM PATH
api['random path should respond to GET with 404'] = done => {
    apiHelpers.makeGetRequest('/this/does/not/exist', res => {
        assert.equal(res.statusCode, 404);
        done();
    });
};

module.exports = api;
