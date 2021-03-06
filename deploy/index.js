
// https://pirple.thinkific.com/courses/take/the-nodejs-master-class


// LOCAL FILE DEPENDENCIES
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

let app = {};

app.init = callback => {
    // START SERVER
    server.init();

    // START CRON JOB
    workers.init();

    // START CLI LAST
    setTimeout(() => {
        cli.init();
        callback();
    }, 50);
};

// SELF INVOKE ONLY IF REQUIRED DIRECTLY
// APP WILL NOT START UNLESS SPECIFIC COMMANDS ARE REQUESTED
if (require.main == module) {
    app.init(() => {});
}

module.exports = app;