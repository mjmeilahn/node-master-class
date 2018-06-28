

// UNIT TESTS



// VANILLA NODE DEPENDENCIES
const assert = require('assert');

// LOCAL FILE DEPENDENCIES
const helpers = require('./../lib/helpers');
const logs = require('./../lib/logs');
const exampleDebuggingProblem = require('./../lib/exampleDebuggingProblem');



// CONTAINER FOR TETS
let unit = {};



// ASSERT THAT "getANumber()" RETURNS 1
unit['helpers.getANumber() should return 1'] = done => {
    const val = helpers.getANumber();
    assert.equal(val, 1);
    done();
};


// ASSERT THAT "getANumber()" RETURNS A NUMBER
unit['helpers.getANumber() should return a number'] = done => {
    const val = helpers.getANumber();
    assert.equal(typeof(val), 'number');
    done();
};


// ASSERT THAT "getANumber()" RETURNS 2
unit['helpers.getANumber() should return 2'] = done => {
    const val = helpers.getANumber();
    assert.equal(val, 2);
    done();
};



// logs.list() SHOULD CALLBACK AN ARRAY AND A FALSE ERROR
unit['logs.list() should callback a false error and array of log names'] = done => {
    logs.list(true, (err, logFiles) => {
        assert.equal(err, false);
        assert.ok(logFiles instanceof Array);
        assert.ok(logFiles.length > 1);
    });
    done();
};

// logs.truncate() SHOULD NOT THROW IF LOG'S ID DOES NOT EXIST
unit['logs.truncate() should not throw if log\'s ID does not exist'] = done => {
    assert.doesNotThrow(() => {
        logs.truncate('Not a real log file name', err => {
            assert.ok(err);
            done();
        });
    }, TypeError);
};


// exampleDebuggingProblem() SHOULD NOT THROW BUT IT DOES
unit['exampleDebuggingProblem() should not throw but it will'] = done => {
    assert.doesNotThrow(() => {
        exampleDebuggingProblem.init();
        done();
    }, TypeError);
};


module.exports = unit;