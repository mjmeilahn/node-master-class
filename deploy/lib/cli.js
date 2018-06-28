
// VANILLA NODE DEPENDENCIES
const childProcess = require('child_process');
const readline = require('readline');
const os = require('os');
const v8 = require('v8');
const util = require('util');
const debug = util.debuglog('cli');

const events = require('events');
class _events extends events {};
const e = new _events();


// LOCAL FILE DEPENDENCIES
const type = require('./type');
const file = require('./file');
const logs = require('./logs');
const helpers = require('./helpers');


let cli = {};



// INPUT HANDLERS
e.on('man', str => {
    cli.responders.help();
});

e.on('help', str => {
    cli.responders.help();
});

e.on('exit', str => {
    cli.responders.exit();
});

e.on('stats', str => {
    cli.responders.stats();
});

e.on('list users', str => {
    cli.responders.listUsers();
});

e.on('more user info', str => {
    cli.responders.moreUserInfo(str);
});

e.on('list checks', str => {
    cli.responders.listChecks(str);
});

e.on('more check info', str => {
    cli.responders.moreCheckInfo(str);
});

e.on('list logs', str => {
    cli.responders.listLogs();
});

e.on('more log info', str => {
    cli.responders.moreLogInfo(str);
});



// VERTICAL SPACING ON CONSOLE
cli.verticalSpace = lines => {
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;

    for (let i = 0; i < lines; i++) {
        console.log('');
    }
};


// HORIZONTAL LINE ON CONSOLE
cli.horizontalLine = () => {
    const width = process.stdout.columns;

    let line = '';

    for (let i = 0; i < width; i++) {
        line += '-';
    }

    console.log(line);
};



// CENTERED TEXT ON CONSOLE
cli.centered = str => {
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

    const width = process.stdout.columns;

    // CALCULATE LEFT PADDING
    let leftPadding = Math.floor((width - str.length) / 2);

    // PUT IN LEFT PADDED SPACES BEFORE STRING
    let line = '';

    for (let i = 0; i < leftPadding; i++) {
        line += ' ';
    }

    line += str;
    console.log(line);
}



// RESPONDERS
cli.responders = {};

cli.responders.help = () => {
    const commands = {
        'exit' : 'Kill the CLI and the whole application',
        'man' : 'Show this help page',
        'help' : 'Alias of the "man" command',
        'stats' : 'Get statistics of the operating system and resource utilization',
        'list users' : 'Show list of all registered (undeleted) users in system',
        'more user info --{userID}' : 'Show details of specific user',
        'list checks --up --down' : 'Show list of all active checks in system, including their state. The "--up" and "--down" flags are both optional',
        'more check info --{checkID}' : 'Show details of specific check',
        'list logs' : 'Show list of all log files available, compressed only',
        'more log info --{fileName}' : 'Show details of specific log file'
    };

    // SHOW HEADER FOR HELP AS WIDE AS SCREEN
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // SHOW EACH COMMAND FOLLOWED BY ITS EXPLANATION
    for (let key in commands) {
        if (commands.hasOwnProperty(key)) {
            let value = commands[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            let padding = 60 - line.length;

            for (let i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;

            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // END WITH HORIZONTAL LINE
    cli.horizontalLine();
};

cli.responders.exit = () => {
    process.exit(0);
};

cli.responders.stats = () => {
    const loadAvg = os.loadavg().join(' ');

    const cpuCount = os.cpus().length;

    const freeMemory = os.freemem();

    const currentMallocMemory = v8.getHeapStatistics().malloced_memory;

    const peakMallocMemory = v8.getHeapStatistics().peak_malloced_memory;

    const allocatedHeapUsed = Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100);

    const allocatedHeapAlloc = Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100);

    const uptime = os.uptime() + ' Seconds';



    // COMPILE AN OBJECT OF STATS
    const stats = {
        'Load Average' : loadAvg,
        'CPU Count' : cpuCount,
        'Free Memory' : freeMemory,
        'Current Malloced Memory' : currentMallocMemory,
        'Peak Malloced Memory' : peakMallocMemory,
        'Allocated Heap Used (%)' : allocatedHeapUsed,
        'Available Heap Allocated (%)' : allocatedHeapAlloc,
        'Uptime' : uptime
    };

    // CREATE HEADER FOR STATS
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // SHOW EACH COMMAND FOLLOWED BY ITS EXPLANATION
    for (let key in stats) {
        if (stats.hasOwnProperty(key)) {
            let value = stats[key];
            let line = '\x1b[33m' + key + '\x1b[0m';
            let padding = 60 - line.length;

            for (let i = 0; i < padding; i++) {
                line += ' ';
            }

            line += value;

            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // END WITH HORIZONTAL LINE
    cli.horizontalLine();
};

cli.responders.listUsers = () => {
    file.list('users', (err, userIDs) => {
        if (!err && userIDs && userIDs.length > 0) {
            cli.verticalSpace();

            userIDs.forEach( userID => {
                file.read('users', userID, (err, userData) => {
                    if (!err && userData) {
                        let line = `Name: ${userData.firstName} ${userData.lastName} Phone: ${userData.phone} Checks: `;
                        let numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;

                        line += numberOfChecks;

                        console.log(line);

                        cli.verticalSpace();
                    }
                });
            });
        }
    });
};

cli.responders.moreUserInfo = str => {

    // GET ID FROM STRING
    const arr = str.split('--');
    const userID = type.string(arr[1]);

    if (userID) {
        file.read('users', userID, (err, userData) => {
            if (!err && userData) {

                // REMOVE HASHED PASSWORD
                delete userData.hasedPassword;

                // PRINT JSON WITH HIGHLIGHTED TEXT
                cli.verticalSpace();

                console.dir(userData, {'colors' : true});

                cli.verticalSpace();
            }
        });
    }
};

cli.responders.listChecks = str => {
    file.list('checks', (err, checkIDs) => {
        if (!err && checkIDs && checkIDs.length > 0) {
            cli.verticalSpace();

            checkIDs.forEach(checkID => {
                file.read('checks', checkID, (err, checkData) => {
                    if (!err && checkData) {
                        let includeCheck = false;
                        const lowerStr = str.toLowerCase();

                        // GET STATE OF CHECK, DEFAULT TO "down"
                        let state = typeof(checkData.state) == 'string' ? checkData.state : 'down';

                        // GET STATE OF CHECK, DEFAULT TO "unknown"
                        let stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';

                        // IF USER HAS SPECIFIED STATE OR NOT
                        if (lowerStr.indexOf('--' + state) > -1 || (lowerStr.indexOf('--down') == -1 && lowerStr.indexOf('--up') == -1)) {
                            let line = `ID: ${checkData.id} ${checkData.method.toUpperCase()} ${checkData.protocol}://${checkData.url} State: ${stateOrUnknown}`;

                            console.log(line);

                            cli.verticalSpace();
                        }
                    }
                });
            });
        } 
    });
};

cli.responders.moreCheckInfo = str => {
    // GET ID FROM STRING
    const arr = str.split('--');
    const checkID = type.string(arr[1]);

    if (checkID) {
        file.read('checks', checkID, (err, checkData) => {
            if (!err && checkData) {

                // PRINT JSON WITH HIGHLIGHTED TEXT
                cli.verticalSpace();

                console.dir(checkData, {'colors' : true});

                cli.verticalSpace();
            }
        });
    }
};

cli.responders.listLogs = () => {
    const ls = childProcess.spawn('ls', ['./.logs/']);
    ls.stdout.on('data', data => {
        // EXPLODE INTO SEPARATE LINES
        const dataStr = data.toString();
        const fileNames = dataStr.split('\n');

        cli.verticalSpace();

        fileNames.forEach(logFile => {
            if (typeof(logFile) == 'string' && logFile.length > 0 && logFile.indexOf('-') > -1) {
                console.log(logFile.trim().split('.')[0]);
                cli.verticalSpace();
            }
        });
    });

    // logs.list(true, (err, logFiles) => {
    //     if (!err && logFiles && logFiles.length > 0) {
            
    //     }
    // });
};

cli.responders.moreLogInfo = str => {
    // GET LOG FILE NAME FROM STRING
    const arr = str.split('--');
    const logFile = type.string(arr[1]);

    if (logFile) {
        cli.verticalSpace();

        // DECOMPRESS LOG FILE
        logs.decompress(logFile, (err, strData) => {
            if (!err && strData) {
                // SPLIT INTO LINES
                const arr = strData.split('\n');

                arr.forEach(jsonStr => {
                    let logObj = helpers.parseJsonToObject(jsonStr);

                    if (logObj && JSON.stringify(logObj) !== '{}') {
                        console.dir(logObj, {'colors': true});

                        cli.verticalSpace();
                    }
                });
            }
        });
    }
};



// INPUT PROCESSOR
cli.processInput = str => {
    str = type.string(str);

    // ONLY PROCESS IF STR HAS VALUE
    if (str) {
        const uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // GO THROUGH ALL INPUTS...
        // EMIT EVENT WHEN MATCH IS FOUND
        let matchFound = false;
        let counter = 0;

        uniqueInputs.some( input => {
            if (str.toLowerCase().indexOf(input) > -1) {
                matchFound = true;

                // EMIT EVENT MATCHING INPUT
                // INCLUDE FULL STRING
                e.emit(input, str);
                return true;
            }
        });

        // IF NO MATCH, TRY AGAIN
        if (!matchFound) {
            console.log('Invalid Command: Sorry, try again');
        }
    }
};

cli.init = () => {
    // SEND START MESSAGE IN DARK BLUE
    console.log('\x1b[34m%s\x1b[0m', "The CLI is running...");

    // START INTERFACE
    let _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    // CREATE INITIAL PROMPT
    _interface.prompt();

    // HANDLE EACH LINE OF INPUT SEPARATELY
    _interface.on('line', str => {

        // SEND TO INPUT PROCESSOR
        cli.processInput(str);

        // RE-INITIALIZE PROMPT AFTERWARDS
        _interface.prompt();
    });

    // IF USER STOPS CLI
    _interface.on('close', () => {
        process.exit(0);
    });
};

module.exports = cli;