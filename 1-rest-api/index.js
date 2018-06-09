// PRIMARY FILE

// VANILLA NODE DEPENDENCIES
const http = require('http');
const https = require('https');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

// LOCAL FILE DEPENDENCIES
const config = require('./config');



// CREATE HTTP SERVER
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// START THE SERVER
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

// SERVER LOGIC FOR HTTP & HTTPS
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

    // GET THE PAYLOAD, IF ANY
    const decoder = new stringDecoder('utf-8');
    let buffer = '';

    req.on('data', data => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // CHOOSE THE HANDLER THIS REQUEST SHOULD GO TO.
        // IF ONE IS NOT FOUND, USE THE NOTFOUND HANDLER.
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // CONSTRUCT THE DATA OBJECT TO SEND TO HANDLER
        const data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // ROUTE TO THE REQUEST SPECIFIED IN CHOSENHANDLER
        chosenHandler(data, (statusCode, payload) => {
            // USE THE STATUS CODE CALLED BACK BY THE HANDLER...
            // OR DEFAULT TO 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // USE THE PAYLOAD CALLED BACK BY THE HANDLER...
            // OR DEFAULT TO AN EMPTY OBJECT
            payload = typeof(payload) == 'object' ? payload : {};

            // CONVERT THE PAYLOAD TO A STRING
            const payloadString = JSON.stringify(payload);

            // RETURN THE RESPONSE
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            // LOG THE REQUEST
            console.log('Returning this response: ', statusCode, payloadString);
        });

        // console.log('Request received with this payload: ', buffer);

        // console.log(`${ method }: ${ trimmedPath }, `, queryStringObject);

        // console.log(`Request received with these headers: `, headers);
    });
};

// DEFINE THE HANDLERS
const handlers = {};

// PING HANDLER
handlers.ping = (data, callback) => {
    callback(200);
};

// NOT FOUND HANDLER
handlers.notFound = (data, callback) => {
    callback(404);
};

// DEFINE A REQUEST ROUTER
const router = {
    'ping' : handlers.ping
};