
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
/* @TODO: ONLY LET AUTHENTICATED USER ACCESS THEIR OBJECT */
/* @TODO: Refactor to Promise pattern */
handlers._users.get = (data, callback) => {
    // CHECK PHONE NUMBER IS VALID
    const phone = helpers.validate('phone', data.queryStringObject.phone);

    if (phone) {
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
        callback(400, {'Error':'Missing required field'});
    }
};

// USERS - PUT
// REQUIRED: PHONE
// OPTIONAL: FIRST NAME, LAST NAME, PASSWORD - AT LEAST ONE MUST BE SPECIFIED
/* @TODO ONLY LET AUTHENTICATED USER UPDATE THEIR INFO */
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
            callback(400, {'Error':'Missing fields to update'});
        }
    } else {
        callback(400, {'Error':'Missing required field.'});
    }
};

// USERS - DELETE
// REQUIRED: PHONE
/* @TODO: ONLY LET AUTHENTICATED USER DELETE THEIR DATA */
/* @TODO: DELETE ALL DATA FROM USER */
handlers._users.delete = (data, callback) => {
    // CHECK PHONE IS VALID
    const phone = helpers.validate('phone', data.queryStringObject.phone);

    if (phone) {
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