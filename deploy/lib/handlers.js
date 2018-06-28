

// VANILLA NODE DEPENDENCIES
const _url = require('url');
const dns = require('dns');
const { performance } = require('perf_hooks');
const util = require('util');
const debug = util.debuglog('performance');


// LOCAL FILE DEPENDENCIES
const file = require('./file');
const helpers = require('./helpers');
const type = require('./type');
const config = require('./config');

let handlers = {};


/* * * * * * * * * * * * * *
*       HMTL HANDLERS        
* * * * * * * * * * * * * * */

// INDEX HANDLER
handlers.index = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Uptime Monitoring - Made Simple',
            'head.description' : 'We offer free, simple uptime monitoring HTTP/HTTPS sites of all kinds. When your site goes down, we\'ll send you a text to let you know',
            'body.class' : 'index'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('index', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};


// CREATE ACCOUNT HANDLER
handlers.accountCreate = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Create An Account',
            'head.description' : 'Signup is easy and only takes a few seconds',
            'body.class' : 'accountCreate'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('accountCreate', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// EDIT ACCOUNT HANDLER
handlers.accountEdit = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Account Settings',
            'body.class' : 'accountEdit'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('accountEdit', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// ACCOUNT HAS BEEN DELETED HANDLER
handlers.accountDeleted = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Account Deleted',
            'head.description' : 'Your account has been deleted',
            'body.class' : 'accountDeleted'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('accountDeleted', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};


// SESSION CREATE HANDLER
handlers.sessionCreate = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Log in to you Account',
            'head.description' : 'Please enter your phone number and password to access your account',
            'body.class' : 'sessionCreate'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('sessionCreate', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// SESSION DELETE HANDLER
handlers.sessionDeleted = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Logged Out',
            'head.description' : 'You have been logged out of your account',
            'body.class' : 'sessionDeleted'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('sessionDeleted', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// CHECK CREATE HANDLER
handlers.checksCreate = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Create a new Check',
            'body.class' : 'checksCreate'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('checksCreate', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// VIEW ALL CHECKS HANDLER
handlers.checksList = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Dashboard',
            'body.class' : 'checksList'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('checksList', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// EDIT CHECKS HANDLER
handlers.checksEdit = (data, callback) => {
    // REJECT ANY REQUEST THAT ISN'T A HTTP(S) "GET"
    if (data.method == 'GET') {
        // PREPARE DATA FOR INTERPOLATION
        const templateData = {
            'head.title' : 'Check Details',
            'body.class' : 'checksEdit'
        };

        // READ TEMPLATE AS A STRING
        helpers.getTemplate('checksEdit', templateData, (err, str) => {
            if (!err && str) {
                // ADD UNIVERSAL HEADER & FOOTER
                helpers.addUniversalTemplate(str, templateData, (err, str) => {
                    if (!err && str) {
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

// FAVICON HANDLER
handlers.favicon = (data, callback) => {
    if (data.method == 'GET') {
        // READ FAVICON DATA
        helpers.getStaticAsset('favicon.ico', (err, data) => {
            if (!err && data) {
                callback(200, data, 'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
};


// PUBLIC ASSETS
handlers.public = (data, callback) => {
    if (data.method == 'GET') {
        // GET FILE NAME BEING REQUESTED
        const trimmedAssetName = data.trimmedPath
                                        .replace('public/', '')
                                        .trim();
        if (trimmedAssetName.length > 0) {
            // READ ASSET DATA
            helpers.getStaticAsset(trimmedAssetName, (err, data) => {
                if (!err && data) {
                    // DETERMINE CONTENT TYPE
                    // DEFAULT TO PLAIN TEXT IF NO TYPE SPECIFIED
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('.css') > -1) {
                        contentType = 'css';
                    }

                    if (trimmedAssetName.indexOf('.js') > -1) {
                        contentType = 'js';
                    }

                    if (trimmedAssetName.indexOf('.png') > -1) {
                        contentType = 'png';
                    }

                    if (trimmedAssetName.indexOf('.jpg') > -1) {
                        contentType = 'jpg';
                    }

                    if (trimmedAssetName.indexOf('.ico') > -1) {
                        contentType = 'ico';
                    }

                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        } else {
            callback(404);
        }
    } else {
        callback(405);
    }
};



/* * * * * * * * * * * * * * * * * *
*         JSON API HANDLERS         
* * * * * * * * * * * * * * * * * * */

// USERS HANDLER
handlers.users = (data, callback) => {

    // LOWERCASE ALL HTTP METHODS...
    // OUR FUNCTIONS USE LOWERCASE
    const method = data.method.toLowerCase();
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // IF ARRAY CONTAINS HTTP METHOD, FIRE THAT HTTP HANDLER
    (acceptableMethods.indexOf(method) > -1) ? handlers._users[method](data, callback) : callback(405, {'Error':'HTTP method not recognized'});
};


handlers._users = {};

// USERS - POST
// REQUIRED: FIRST NAME, LAST NAME, PHONE, PASSWORD, tosAGREEMENT
handlers._users.post = (data, callback) => {
    // VALIDATE INCOMING DATA
    const firstName = type.string(data.payload.firstName);
    const lastName = type.string(data.payload.lastName);
    const phone = type.phone(data.payload.phone);
    const password = type.string(data.payload.password);
    const tosAgreement = type.boolean(data.payload.tosAgreement);

    // CHECK THAT ALL FIELDS ARE FILLED OUT
    if (firstName && lastName && phone && password && tosAgreement) {

        // MAKE SURE USER DOESN'T ALREADY EXIST
        file.read('users', phone, (err, data) => {
            if (err) {
                // HASH THE PASSWORD
                const hashedPassword = helpers.hash(password);

                if (hashedPassword) {
                    // CREATE USER OBJECT
                    let userObject = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };

                    // STORE THE USER
                    file.create('users', phone, userObject, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            // console.log(err);
                            callback(500, {'Error':'Could not create new user'});
                        }
                    });
                } else {
                    callback(500, {'Error':'Could not hash the password'});
                }
            } else {
                callback(400, {'Error':'A user with that phone number already exists'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required fields'});
    }
};

// USERS - GET
// REQUIRED: PHONE
handlers._users.get = (data, callback) => {
    // CHECK PHONE NUMBER IS VALID
    const phone = type.phone(data.queryStringObject.phone);

    if (phone) {
        // GET TOKEN FROM HEADERS
        const token = type.string(data.headers.token);

        // VERIFY TOKEN IS VALID FOR PHONE
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                // LOOK UP USER
                file.read('users', phone, (err, data) => {
                    if (!err && data) {
                        // REMOVE HASHED PASSWORD BEFORE RETURNED REQUEST
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404, {'Error':'user phone not found'});
                    }
                });
            } else {
                callback(403, {'Error':'Missing required token in header or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};

// USERS - PUT
// REQUIRED: PHONE
// OPTIONAL: FIRST NAME, LAST NAME, PASSWORD - AT LEAST ONE MUST BE SPECIFIED
handlers._users.put = (data, callback) => {
    // CHECK PHONE NUMBER IS VALID
    const phone = type.phone(data.payload.phone);

    // CHECK FOR OPTIONAL FIELDS
    const firstName = type.string(data.payload.firstName);
    const lastName = type.string(data.payload.lastName);
    const password = type.string(data.payload.password);

    // ERROR IF PHONE IS INVALID
    if (phone) {
        // ERROR IF NOTHING IS SENT TO UPDATE
        if (firstName || lastName || password) {

            // GET TOKEN FROM HEADERS
            const token = type.string(data.headers.token);
            
            // VERIFY TOKEN IS VALID FOR PHONE
            handlers._tokens.verifyToken(token, phone, tokenIsValid => {
                if (tokenIsValid) {
                    // LOOK UP THE USER
                    file.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // UPDATE FIELDS
                            (firstName) ? userData.firstName = firstName : '';
                            (lastName) ? userData.lastName = lastName : '';
                            (password) ? userData.hashedPassword = helpers.hash(password) : '';

                            // STORE UPDATES
                            file.update('users', phone, userData, err => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    // console.log(err);
                                    callback(500, {'Error':'Could not update the user'});
                                }
                            });
                        } else {
                            callback(400, {'Error':'The specified user does not exist'});
                        }
                    });
                } else {
                    callback(403, {'Error':'Missing required token in header or token is invalid'});
                }
            });
        } else {
            callback(400, {'Error':'Missing fields to update'});
        }
    } else {
        callback(400, {'Error':'Missing required field.'});
    }
};

// USERS - DELETE
// REQUIRED: PHONE
handlers._users.delete = (data, callback) => {
    // CHECK PHONE IS VALID
    const phone = type.phone(data.queryStringObject.phone);

    if (phone) {
        // GET TOKEN FROM HEADERS
        const token = type.string(data.headers.token);

        // VERIFY TOKEN IS VALID FOR PHONE
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                file.read('users', phone, (err, data) => {
                    if (!err && data) {
                        file.delete('users', phone, err => {
                            if (!err) {
                                // DELETE CHECKS ASSOCIATED WITH USER
                                const userChecks = type.checks(data.checks);
                                const checksToDelete = userChecks.length;

                                if (checksToDelete > 0) {
                                    let checksDeleted = 0;
                                    let deletionErrors = false;

                                    // LOOP THROUGH CHECKS
                                    userChecks.forEach(id => {
                                        // DELETE THE CHECK
                                        file.delete('checks', id, err => {
                                            if (err) deletionErrors = true;

                                            checksDeleted++;
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error':'Could not delete all user\'s checks. All checks may not have been deleted.'});
                                                }
                                            }
                                        });
                                    });
                                } else {
                                    callback(200);
                                }
                            } else {
                                callback(500, {'Error':'Could not delete specified user'});
                            }
                        });
                    } else {
                        callback(400, {'Error':'could not find user'});
                    }
                });
            } else {
                callback(403, {'Error':'Missing required token in header or token is invalid'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};



// TOKENS HANDLER
handlers.tokens = (data, callback) => {

    // LOWERCASE ALL HTTP METHODS...
    // OUR FUNCTIONS USE LOWERCASE
    const method = data.method.toLowerCase();
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // IF ARRAY CONTAINS HTTP METHOD, FIRE THAT HTTP HANDLER
    (acceptableMethods.indexOf(method) > -1) ? handlers._tokens[method](data, callback) : callback(405, {'Error':'user HTTP method not allowed'});
};

handlers._tokens = {};

// TOKENS - POST
// REQUIRED: PHONE, PASSWORD
handlers._tokens.post = (data, callback) => {
    performance.mark('entered TOKEN POST function');

    const phone = type.phone(data.payload.phone);
    const password = type.string(data.payload.password);

    performance.mark('inputs validated');

    if (phone && password) {
        performance.mark('beginning user lookup');

        // LOOK UP MATCHING USER
        file.read('users', phone, (err, userData) => {
            performance.mark('user lookup complete');
            if (!err && userData) {
                performance.mark('beginning password hash');
                // HASH THE SENT PASSWORD
                // COMPARE AGAINST STORED PASSWORD
                const hashedPassword = helpers.hash(password);

                performance.mark('password hash complete');
                if (hashedPassword == userData.hashedPassword) {
                    performance.mark('creating data for token');
                    // CREATE TOKEN WITH RANDOM NAME
                    // SET EXPIRATION DATE 1 HOUR IN FUTURE
                    const tokenId = helpers.createRandomString(20);


                    const expires = Date.now() + 1000 * 60 * 60;

                    const tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires' : expires
                    };

                    // STORE TOKEN
                    performance.mark('beginning storing token');
                    file.create('tokens', tokenId, tokenObject, err => {
                        performance.mark('storing token complete');

                        // GATHER ALL PERFORMANCE BENCHMARKS
                        performance.measure('Beginning to End', 'entered TOKEN POST function', 'storing token complete');

                        performance.measure('Validating user input', 'entered TOKEN POST function', 'inputs validated');

                        performance.measure('User lookup', 'beginning user lookup', 'user lookup complete');

                        performance.measure('Password hashing', 'beginning password hash', 'password hash complete');

                        performance.measure('Token data creation', 'creating data for token', 'beginning storing token');

                        performance.measure('Token storing data', 'beginning storing token', 'storing token complete');

                        // LOG ALL MEASUREMENTS
                        const measurements = performance.getEntriesByType('measure');

                        measurements.forEach(measurement => {
                            debug('\x1b[33m%s\x1b[0m', measurement.name + ' ' + measurement.duration);
                        });

                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error':'Could not create new token'});
                        }
                    });
                } else {
                    callback(400, {'Error':'Entered password does not match stored password'});
                }
            } else {
                callback(400, {'Error':'Could not find user'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required fields'});
    }
};

// TOKENS - PUT
// REQUIRED: ID, EXTEND
handlers._tokens.put = (data, callback) => {
    // CHECK ID IS VALID
    const id = type.id(data.payload.id);
    const extend = type.boolean(data.payload.extend);

    if (id && extend) {
        // LOOK UP TOKEN
        file.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // CHECK IF TOKEN IS EXPIRED
                if (tokenData.expires > Date.now()) {
                    // SET EXPIRATION AN HOUR FROM NOW
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // STORE NEW UPDATES
                    file.update('tokens', id, tokenData, err => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error':'could not update token expiration'});
                        }
                    });
                } else {
                    callback(400, {'Error':'the token has expired & cannot be extended'});
                }
            } else {
                callback(400, {'Error':'Token does not exist'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required fields or fields are invalid'});
    }
};

// TOKENS - GET
// REQUIRED: ID
handlers._tokens.get = (data, callback) => {
    // CHECK ID IS VALID
    const id = type.id(data.queryStringObject.id);
    if (id) {
        file.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, {'Error':'user phone not found'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};

// TOKENS - DELETE
// REQUIRED: ID
handlers._tokens.delete = (data, callback) => {
    // CHECK ID IS VALID
    const id = type.id(data.queryStringObject.id);

    if (id) {
        file.read('tokens', id, (err, data) => {
            if (!err && data) {
                file.delete('tokens', id, err => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error':'Could not delete specified token'});
                    }
                });
            } else {
                callback(400, {'Error':'could not find token'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};

// VERIFY IF TOKEN ID IS VALID FOR USER
handlers._tokens.verifyToken = (id, phone, callback) => {
    // LOOK UP TOKEN
    file.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // CHECK IF TOKEN MATCHES USER
            // AND HAS NOT EXPIRED
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

handlers.checks = (data, callback) => {

    // LOWERCASE ALL HTTP METHODS...
    // OUR FUNCTIONS USE LOWERCASE
    const method = data.method.toLowerCase();
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // IF ARRAY CONTAINS HTTP METHOD, FIRE THAT HTTP HANDLER
    (acceptableMethods.indexOf(method) > -1) ? handlers._checks[method](data, callback) : callback(405, {'Error':'user HTTP method not allowed'});
};

handlers._checks = {};

// CHECKS - POST
// REQUIRED: PROTOCOL, URL, HTTP METHOD, SUCCESS CODE, TIMEOUT SECONDS
handlers._checks.post = (data, callback) => {
    // VALIDATE INCOMING DATA
    const protocol = type.protocol(data.payload.protocol);
    const url = type.string(data.payload.url);
    const method = type.http(data.payload.method);
    const successCodes = type.successCodes(data.payload.successCodes);
    const timeoutSeconds = type.number(data.payload.timeoutSeconds);

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // GET TOKEN FROM HEADERS
        const token = type.string(data.headers.token);

        // LOOK UP USER BY TOKEN
        file.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone;

                // LOOK UP USER
                file.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = type.checks( userData.checks);

                        // VERIFY USER HAS LESS THAN 5 CHECKS
                        if (userChecks.length < config.maxChecks) {

                            // VERIFY URL HAS DNS ENTRIES
                            const parsedURL = _url.parse(`${protocol}://${url}`, true);

                            const hostName = type.string(parsedURL.hostname);

                            dns.resolve(hostName, (err, records) => {
                                if (!err && records) {
                                    // CREATE RANDOM ID FOR NEW CHECK
                                    const checkId = helpers.createRandomString(20);

                                    // CREATE CHECK OBJECT, INCLUDE USER PHONE
                                    const checkObject = {
                                        'id' : checkId,
                                        'phone' : userPhone,
                                        'protocol' : protocol,
                                        'url' : url,
                                        'method' : method,
                                        'successCodes' : successCodes,
                                        'timeoutSeconds' : timeoutSeconds
                                    };

                                    // STORE THE DATA
                                    file.create('checks', checkId, checkObject, err => {
                                        if (!err) {
                                            // ADD THE CHECK ID TO USER OBJECT
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);

                                            // SAVE THE NEW USER DATA
                                            file.update('users', userPhone, userData, err => {
                                                if (!err) {
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {'Error':'Could not update user with new check'});
                                                }
                                            })
                                        } else {
                                            callback(500, {'Error':'Could not create new check'});
                                        }
                                    });
                                } else {
                                    callback(400, {'Error': 'The host name of URL did not resolve to any DNS entries'});
                                }
                            });
                        } else {
                            callback(400, {'Error':`the user already has the maximum number of checks: ${config.maxChecks}`});
                        }
                    } else {
                        callback(403, {'Error':'Token does not match a user'});
                    }
                });
            } else {
                callback(400, {'Error':'Token does not exist'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required fields or inputs are invalid'});
    }
};

// CHECKS - GET
// REQUIRED: ID
handlers._checks.get = (data, callback) => {
    // CHECK ID IS VALID
    const id = type.id(data.queryStringObject.id);

    if (id) {
        // LOOK UP THE CHECK
        file.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                // GET TOKEN FROM HEADERS
                const token = type.string(data.headers.token);

                // VERIFY TOKEN IS VALID FOR USER WHO CREATED CHECK
                handlers._tokens.verifyToken(token, checkData.phone, tokenIsValid => {
                    if (tokenIsValid) {
                        // RETURN CHECK DATA
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};


// CHECKS - PUT
// REQUIRED - ID & AT LEAST ONE OF: PROTOCOL, URL, METHOD, SUCCESSCODES OR TIMEOUT SECONDS
handlers._checks.put = (data, callback) => {
    const id = type.id(data.payload.id);
    const protocol = type.protocol(data.payload.protocol);
    const url = type.string(data.payload.url);
    const method = type.http(data.payload.method);
    const successCodes = type.successCodes(data.payload.successCodes);
    const timeoutSeconds = type.number(data.payload.timeoutSeconds);

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            // LOOK UP CHECK
            file.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // GET TOKEN FROM HEADERS
                    const token = type.string(data.headers.token);

                    // VERIFY TOKEN IS VALID FOR USER WHO CREATED CHECK
                    handlers._tokens.verifyToken(token, checkData.phone, tokenIsValid => {
                        if (tokenIsValid) {
                            // UPDATE THE CHECK
                            if (protocol) checkData.protocol = protocol;
                            if (url) checkData.url = url;
                            if (method) checkData.method = method;
                            if (successCodes) checkData.successCodes = successCodes;
                            if (timeoutSeconds) checkData.timeoutSeconds = timeoutSeconds;

                            file.update('checks', id, checkData, err => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {'Error':'Could not update check'});
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(400, {'Error':'Check does not exist'});
                }
            });
        } else {

        }
    } else {
        callback(400, {'Error':'Missing required fields'});
    }
};


// CHECKS - DELETE
// REQUIRED: ID
handlers._checks.delete = (data, callback) => {
    // CHECK ID IS VALID
    const id = type.id(data.queryStringObject.id);

    if (id) {
        // LOOK UP CHECK
        file.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                // GET TOKEN FROM HEADERS
                const token = type.string(data.headers.token);

                // VERIFY TOKEN IS VALID FOR PHONE
                handlers._tokens.verifyToken(token, checkData.phone, tokenIsValid => {
                    if (tokenIsValid) {
                        // DELETE THE CHECK
                        file.delete('checks', id, err => {
                            if (!err) {
                                // LOOK UP USER
                                file.read('users', checkData.phone, (err, userData) => {
                                    if (!err && userData) {
                                        // GET ALL USER CHECKS
                                        const userChecks = type.checks( userData.checks);

                                        // REMOVE CHECK FROM USER
                                        const checkPosition = userChecks.indexOf(id);

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);

                                            // RE-SAVE USER DATA
                                            file.update('users', checkData.phone, userData, err => {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error':'could not delete '});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Error':'cannot find check on user object'});
                                        }
                                    } else {
                                        callback(400, {'Error':'could not find user'});
                                    }
                                });
                            } else {
                                callback(500, {'Error':'could not delete check'});
                            }
                        });
                    } else {
                        callback(403, {'Error':'Missing required token in header or token is invalid'});
                    }
                });
            } else {
                callback(400, {'Error':'the check does not exist'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field'});
    }
};


// EXAMPLE ERROR HANDLER
handlers.exampleError = (data, callback) => {
    const error = new Error('This is an example error');
    throw(error);
};


// PING HANDLER
handlers.ping = (data, callback) => {
    callback(200);
};

// NOT FOUND HANDLER
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;