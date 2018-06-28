
// TEST RUNNER


// OVERRIDE NODE_ENV VARIABLE
process.env.NODE_ENV = 'testing';


// APP LOGIC FOR TEST RUNNER
let app = {};


// CONTAINER FOR TESTS
app.tests = {};


// ADD UNIT TESTS AS DEPENDENCY
app.tests.unit = require('./unit');
app.tests.api = require('./api');


// COUNT ALL ASSERTION TEST
app.countTests = () => {
    let counter = 0;

    for (let key in app.tests) {
        if (app.tests.hasOwnProperty(key)) {
            let subtests = app.tests[key];

            for (let testName in subtests) {
                if (subtests.hasOwnProperty(testName)) {
                    counter++;
                }
            }
        }
    }

    return counter;
};


// RUN ALL ASSERTION TESTS
app.runTests = () => {
    let errors = [];
    let successes = 0;
    let counter = 0;
    const limit = app.countTests();

    for (let key in app.tests) {
        if (app.tests.hasOwnProperty(key)) {
            let subTests = app.tests[key];

            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    // IIFE
                    (function() {
                        let tempTestName = testName;
                        let testValue = subTests[testName];

                        // CALL THE TEST
                        // IF IT THROWS, OUR SINGLE
                        // THREAD WILL BREAK.

                        // HANDLE IN TRY-CATCH TO ENSURE APP STAYS UP
                        try {
                            testValue(() => {
                                // IF CALLBACK WITHOUT THROW...
                                // IT SUCCEEDED
                                console.log('\x1b[32m%s\x1b[0m', tempTestName);
                                counter++;
                                successes++;

                                if (counter == limit) {
                                    app.produceTestReport(limit, successes, errors);
                                }
                            });
                        } catch (e) {
                            errors.push({
                                'name' : testName,
                                'error' : e
                            });

                            console.log('\x1b[31m%s\x1b[0m', tempTestName);

                            counter++;

                            if (counter == limit) {
                                app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })();
                }
            }
        }
    }
};


// ASSERTION OUTCOME REPORT
app.produceTestReport = (limit, successes, errors) => {
    console.log('');
    console.log('------BEGIN TEST REPORT------');
    console.log('');
    console.log('Total Tests: ' + limit);
    console.log('Passed: ' + successes);
    console.log('Failed: ' + errors.length);
    console.log('');

    // IF ERRORS, PRINT IN DETAIL
    if (errors.length > 0) {
        console.log('-------BEGIN ERROR DETAILS------');

        errors.forEach(error => {
            console.log('\x1b[31m%s\x1b[0m', error.name);
            console.log(error.error);
            console.log('');
        });

        console.log('-------END ERROR DETAILS------');
    }

    console.log('');
    console.log('------END TEST REPORT------');

    process.exit(0);
};



app.runTests();