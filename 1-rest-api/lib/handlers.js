
// LOCAL FILE DEPENDENCIES
const file = require('./file');
const helpers = require('./helpers');

let handlers = {};

// USERS HANDLER
handlers.users = (data, callback) => {

    // LOWERCASE ALL HTTP METHODS...
    // OUR FUNCTIONS USE LOWERCASE
    const method = data.method.toLowerCase();
    const acceptableMethods = ['post', 'get', 'put', 'delete'];

    // IF ARRAY CONTAINS HTTP METHOD, FIRE THAT HTTP HANDLER
    (acceptableMethods.indexOf(method) > -1) ? handlers._users[method](data, callback) : callback(405, {'Error':'user HTTP method not allowed'});
};



/*
* @TODO: Refactor handlers._users to Promise pattern
*/

handlers._users = {};

// USERS - POST
// REQUIRED: FIRST NAME, LAST NAME, PHONE, PASSWORD, tosAGREEMENT
handlers._users.post = (data, callback) => {
    // CHECK THAT ALL FIELDS ARE FILLED OUT
    const firstName = helpers.validate('str', data.payload.firstName);
    const lastName = helpers.validate('str', data.payload.lastName);
    const phone = helpers.validate('phone', data.payload.phone);
    const password = helpers.validate('str', data.payload.password);
    const tosAgreement = helpers.validate('bool', data.payload.tosAgreement);

    // VALIDATE ALL INPUT FIELDS
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
                            console.log(err);
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
    const phone = helpers.validate('phone', data.queryStringObject.phone);

    if (phone) {
        // GET TOKEN FROM HEADERS
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

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
    const phone = helpers.validate('phone', data.payload.phone);

    // CHECK FOR OPTIONAL FIELDS
    const firstName = helpers.validate('str', data.payload.firstName);
    const lastName = helpers.validate('str', data.payload.lastName);
    const password = helpers.validate('str', data.payload.password);

    // ERROR IF PHONE IS INVALID
    if (phone) {
        // ERROR IF NOTHING IS SENT TO UPDATE
        if (firstName || lastName || password) {

            // GET TOKEN FROM HEADERS
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            
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
                                    console.log(err);
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
/* @TODO: DELETE ALL DATA FROM USER */
handlers._users.delete = (data, callback) => {
    // CHECK PHONE IS VALID
    const phone = helpers.validate('phone', data.queryStringObject.phone);

    if (phone) {
        // GET TOKEN FROM HEADERS
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // VERIFY TOKEN IS VALID FOR PHONE
        handlers._tokens.verifyToken(token, phone, tokenIsValid => {
            if (tokenIsValid) {
                file.read('users', phone, (err, data) => {
                    if (!err && data) {
                        file.delete('users', phone, err => {
                            if (!err) {
                                callback(200);
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
    const phone = helpers.validate('phone', data.payload.phone);
    const password = helpers.validate('str', data.payload.password);

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
    const id = helpers.validate('id', data.payload.id);
    const extend = helpers.validate('bool', data.payload.extend);

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
    const id = helpers.validate('id', data.queryStringObject.id);
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
    const id = helpers.validate('id', data.queryStringObject.id);

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

// PING HANDLER
handlers.ping = (data, callback) => {
    callback(200);
};

// NOT FOUND HANDLER
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;