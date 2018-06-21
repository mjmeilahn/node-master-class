
// CLIENT-SIDE JS


// SMALL LIBRARY FOR TYPE CHECKING
let type = {};

type.boolean = data => {
    return typeof(data) == 'boolean' && data == true ? true : false;
};

type.string = data => {
    return typeof(data) == 'string' && data.trim().length > 0 ? data.trim() : false;
};

type.number = data => {
    return typeof(data) == 'number' && data % 1 === 0 && data >= 1 ? data : false;
};

type.object = data => {
    return typeof(data) == 'object' && data !== null ? data : {};
};

type.isFunction = data => {
    return typeof(data) == 'function' ? data : false;
};

type.method = data => {
    return typeof(data) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(data) > -1 ? data.toUpperCase() : 'GET';
};

type.path = data => {
    return typeof(data) == 'string' && data.length > 0 ? data : '/';
};



// BEGIN APP
let app = {};

app.config = {
    'sessionToken' : false
};

// AJAX CLIENT FOR REST API
app.client = {};

// INTERFACE FOR API CALLS
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    headers = type.object(headers);
    path = type.path(path);
    method = type.method(method);
    queryStringObject = type.object(queryStringObject);
    payload = type.object(payload);
    callback = type.isFunction(callback);

    // FOR EACH QUERY STRING PARAMS, ADD IT TO PATH
    let requestURL = path + '?';
    let counter = 0;

    for (let query in queryStringObject) {
        if (queryStringObject.hasOwnProperty(query)) {
            counter++;
            // IF AT LEAST ONE KEY HAS BEEN ADDED ...
            // PREPEND NEW QUERIES WITH AMPERSAND "&"
            if (counter > 1) {
                requestURL += '&';
            }

            // ADD THE KEY'S VALUE
            requestURL += query + '+' + queryStringObject[query];
        }
    }

    // FORM THE HTTP REQUEST AS JSON
    let xhr = new XMLHttpRequest();
    xhr.open(method, requestURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // FOR EACH HEADER SENT, ADD TO REQUEST
    for (let header in headers) {
        if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, headers[header]);
        }
    }

    // IF THERE IS A TOKEN SET, ADD TOKEN AS HEADER
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken);
    }

    // WHEN REQUEST COMES BACK, HANDLE RESPONSE
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let statusCode = xhr.status;
            let responseReturned = xhr.responseText;

            // CALLBACK IF REQUESTED
            if (callback) {
                try {
                    let parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }
            }
        }
    };

    // SEND PAYLOAD AS JSON
    let payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
};