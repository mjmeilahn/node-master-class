
// https://pirple.thinkific.com/courses/take/the-nodejs-master-class


// VANILLA NODE DEPENDENCIES
const cluster = require('cluster');
const os = require('os');

// LOCAL FILE DEPENDENCIES
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

let app = {};

app.init = callback => {

    // IF ON MASTER THREAD, START CRON & CLI
    if (cluster.isMaster) {

        // START CRON JOB
        workers.init();

        // START CLI LAST
        setTimeout(() => {
            cli.init();
            callback();
        }, 50);

        for (let i = 0; i < os.cpus().length; i++) {
            cluster.fork();
        }
    } else {
        // IF NOT ON MASTER THREAD, START SERVER
        server.init();
    }
};

// SELF INVOKE ONLY IF REQUIRED DIRECTLY
// APP WILL NOT START UNLESS SPECIFIC COMMANDS ARE REQUESTED
if (require.main == module) {
    app.init(() => {});
}

module.exports = app;