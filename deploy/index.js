
// https://pirple.thinkific.com/courses/take/the-nodejs-master-class


// LOCAL FILE DEPENDENCIES
const server = require('./lib/server');
const workers = require('./lib/workers');

let app = {};

app.init = () => {
    // START SERVER
    server.init();

    // START CRON JOB
    // IN A REAL APP, CRON SHOULD HAPPEN OUTSIDE APPLICATION LAYER
    workers.init();
};

// START APP
app.init();

module.exports = app;