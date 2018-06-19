
// SERVER-RELATED TASKS

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
        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // CONSTRUCT THE DATA OBJECT TO SEND TO HANDLER
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // ROUTE TO THE REQUEST SPECIFIED IN CHOSENHANDLER
        chosenHandler(data, (statusCode, payload) => {
            // USE THE STATUS CODE CALLED BACK BY THE HANDLER...
            // OR DEFAULT TO 200
            statusCode = (typeof(statusCode) == 'number') ? statusCode : 200;

            // USE THE PAYLOAD CALLED BACK BY THE HANDLER...
            // OR DEFAULT TO AN EMPTY OBJECT
            payload = (typeof(payload) == 'object') ? payload : {};

            // CONVERT THE PAYLOAD TO A STRING
            const payloadString = JSON.stringify(payload);

            // RETURN THE RESPONSE
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            const acceptableCodes = [200, 201, 300, 301];

            // LOG THE REQUEST AS GREEN OR RED
            if (acceptableCodes.indexOf(statusCode) > -1) {
                debug('\x1b[32m%s\x1b[0m', `${ data.method }: /${ data.trimmedPath }`, data.queryStringObject, statusCode, payloadString);
            } else {
                debug('\x1b[31m%s\x1b[0m', `${ data.method }: /${ data.trimmedPath }`, data.queryStringObject, statusCode, payloadString);
            }
        });
    });
};

// DEFINE A REQUEST ROUTER
server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
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