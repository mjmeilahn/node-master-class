
// https://pirple.thinkific.com/courses/take/the-nodejs-master-class


// LOCAL FILE DEPENDENCIES
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
const exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

let app = {};

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

    let foo = 1;
    foo++;

    foo = foo * foo;

    foo = foo.toString();

    // CALL INIT SCRIPT THAT WILL THROW ERROR
    exampleDebuggingProblem.init();
};

// START APP
app.init();

module.exports = app;