
/*
* @TODO: Online course has heavy nested callbacks targeting earlier versions of JavaScript (ES5) - refactor into Promise pattern after course is finished :/
*/


// LOCAL FILE DEPENDENCIES
const file = require('./file');
const helpers = require('./helpers');
const type = require('./type');
const config = require('./config');

let handlers = {};

// USERS HANDLER
handlers.users = (data, callback) => {

    // LOWERCASE ALL HTTP METHODS...
    // OUR FUNCTIONS USE LOWERCASE
    const method = data.method.toLowerCase();
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // IF ARRAY CONTAINS HTTP METHOD, FIRE THAT HTTP HANDLER
    (acceptableMethods.indexOf(method) > -1) ? handlers._users[method](data, callback) : callback(405, {'Error':'HTTP method not recognized'});
};



/*
* @TODO: Refactor handlers._users to Promise pattern
*/

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
/* @TODO: Refactor to Promise pattern */
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
/* @TODO Refactor into Promise pattern */
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
/* @TODO: Refactor into promise pattern */
handlers._tokens.post = (data, callback) => {
    const phone = type.phone(data.payload.phone);
    const password = type.string(data.payload.password);

    if (phone && password) {
        // LOOK UP MATCHING USER
        file.read('users', phone, (err, userData) => {
            if (!err && userData) {
                // HASH THE SENT PASSWORD
                // COMPARE AGAINST STORED PASSWORD
                const hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
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
                    file.create('tokens', tokenId, tokenObject, err => {
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
/* @TODO: Refactor into Promise pattern */
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
/* @TODO: Refactor into Promise pattern */
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
/* @TODO: Refactor into Promise pattern */
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
/* @TODO: Refactor into Promise pattern */
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
/* @TODO: Refactor into Promise pattern */
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


// PING HANDLER
handlers.ping = (data, callback) => {
    callback(200);
};

// NOT FOUND HANDLER
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;