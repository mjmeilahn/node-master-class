
// SERVER-RELATED TASKS


// @TODO: Refactor function arguments as ES6 default arguments

// VANILLA NODE DEPENDENCIES
const fs = require('fs');
const http = require('http');
const https = require('https');
const stringDecoder = require('string_decoder').StringDecoder;
const url = require('url');
const path = require('path');
const util = require('util');

// CONDITIONALLY SHOW CONSOLE.LOGS WITH NODE_DEBUG=server
const debug = util.debuglog('server');

// LOCAL FILE DEPENDENCIES
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');


let server = {};

// CREATE HTTP SERVER
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// CREATE HTTPS SERVER
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

// BOTH HTTP & HTTPS SERVERS ARE RUNNING
// WHEN THIS FUNCTION IS CALLED
server.unifiedServer = (req, res) => {
    // GET THE URL AND PARSE IT
    const parsedUrl = url.parse(req.url, true);

    // GET THE PATH
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // GET THE QUERY STRING AS AN OBJECT
    const queryStringObject = parsedUrl.query;

    // GET THE HTTP METHOD
    const method = req.method.toUpperCase();

    // GET THE HEADERS AS AN OBJECT
    const headers = req.headers;

    // CREATE EMPTY STRING TO STORE INCOMING DATA
    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    // NOT ALL REQUESTS RETURN DATA
    req.on('data', data => {
        buffer += decoder.write(data);
    });

    // ALL REQUESTS END
    req.on('end', () => {
        buffer += decoder.end();

        // CHOOSE HANDLER FOR REQUEST
        // IF NOT FOUND, USE 404 HANDLER
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // IF REQUEST IS WITHIN /PUBLIC ...
        // USE PUBLIC ROUTE HANDLER
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

        // CONSTRUCT THE DATA OBJECT TO SEND TO HANDLER
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        try {
            // ROUTE TO THE REQUEST SPECIFIED IN CHOSENHANDLER
            chosenHandler(data, (statusCode, payload, contentType) => {
                server.processHandlerResponse(data, res, statusCode, payload, contentType);
            });
        } catch (e) {
            debug(e);
            server.processHandlerResponse(data, res, 500, {'Error':'An unknown error has occurred.'}, 'json');
        }
    });
};

// PROCESS RESPONSE FROM HANDLER
server.processHandlerResponse = (data, res, statusCode, payload, contentType) => {
    // DETERMINE RESPONSE, FALLBACK TO JSON
    contentType = typeof(contentType) == 'string' ? contentType : 'json';

    // USE THE STATUS CODE CALLED BACK BY THE HANDLER...
    // OR DEFAULT TO 200
    statusCode = (typeof(statusCode) == 'number') ? statusCode : 200;

    // RETURN RESPONSE PARTS THAT ARE CONTENT-SPECIFIC
    let payloadString = '';

    if (contentType == 'json') {
        res.setHeader('Content-Type', 'application/json');
        payload = (typeof(payload) == 'object') ? payload : {};
        payloadString = JSON.stringify(payload);
    }

    if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadString = typeof(payload) == 'string' ? payload : '';
    }

    if (contentType == 'favicon') {
        res.setHeader('Content-Type', 'image/x-icon');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'css') {
        res.setHeader('Content-Type', 'text/css');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'js') {
        res.setHeader('Content-Type', 'text/javascript');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'png') {
        res.setHeader('Content-Type', 'image/png');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'jpg') {
        res.setHeader('Content-Type', 'image/jpeg');
        payloadString = typeof(payload) !== 'undefined' ? payload : '';
    }

    if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadString = typeof(payload) == 'string' ? payload : '';
    }

    // RETURN THE RESPONSE
    res.writeHead(statusCode);
    res.end(payloadString);

    const acceptableCodes = [200, 201, 300, 301];

    // LOG THE REQUEST AS GREEN OR RED
    if (acceptableCodes.indexOf(statusCode) > -1) {
        debug('\x1b[32m%s\x1b[0m', `${ data.method }: /${ data.trimmedPath }`, data.queryStringObject, statusCode, payloadString);
    } else {
        debug('\x1b[31m%s\x1b[0m', `${ data.method }: /${ data.trimmedPath }`, data.queryStringObject, statusCode, payloadString);
    }
};

// DEFINE A REQUEST ROUTER
server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'favicon.ico' : handlers.favicon,
    'public' : handlers.public,
    'examples/error' : handlers.exampleError
};


server.init = () => {
    // START HTTP SERVER
    server.httpServer.listen(config.httpPort, () => {
        console.log('\x1b[36m%s\x1b[0m', `${ config.envName.toUpperCase() } - PORT: ${ config.httpPort } is running...`);
    });

    // START HTTPS SERVER
    server.httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[35m%s\x1b[0m', `${ config.envName.toUpperCase() } - PORT: ${ config.httpsPort } is running...`);
    });
};


module.exports = server;