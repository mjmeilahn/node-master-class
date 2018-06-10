
// VANILLA NODE DEPENDENCIES
const fs = require('fs');
const http = require('http');
const https = require('https');
const stringDecoder = require('string_decoder').StringDecoder;
const url = require('url');

// LOCAL FILE DEPENDENCIES
const config = require('./lib/config');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');



// CREATE HTTP SERVER
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// START HTTP SERVER
httpServer.listen(config.httpPort, () => {
    console.log(`The server is listening on port ${ config.httpPort } in ${ config.envName }...`);
});

// CREATE HTTPS SERVER
const httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};

const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// START HTTPS SERVER
httpsServer.listen(config.httpsPort, () => {
    console.log(`The server is listening on port ${ config.httpsPort } in ${ config.envName }...`);
});

// BOTH HTTP & HTTPS SERVERS ARE RUNNING
// WHEN THIS FUNCTION IS CALLED
const unifiedServer = (req, res) => {
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
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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

            // LOG THE REQUEST
            console.log(`${ data.method }: /${ data.trimmedPath }`, data.queryStringObject, statusCode, payloadString);
        });
    });
};

// DEFINE A REQUEST ROUTER
const router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens
};