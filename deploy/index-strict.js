
// https://pirple.thinkific.com/courses/take/the-nodejs-master-class


// LOCAL FILE DEPENDENCIES
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

let app = {};

// DECLARE GLOBAL THAT STRICT MODE SHOULD CATCH
foo = 'bar';

app.init = () => {
    // START SERVER
    server.init();

    // START CRON JOB
    // IN A REAL APP..
    // FILE(S) CRON SHOULD HAPPEN OUTSIDE APPLICATION LAYER
    workers.init();

    // START CLI LAST
    setTimeout(() => {
        cli.init();
    }, 50);
};

// START APP
app.init();

module.exports = app;