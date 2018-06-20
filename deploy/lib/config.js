
let environments = {};

// CONVENTION ON WEB PORTS FOR HTTP & HTTPS ARE:
// HTTP: 80
// HTTPS: 443

// STAGING
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisISaSECRET',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    },
    'templateGlobals' : {
        'appName' : 'UptimeChecker',
        'companyName' : 'NotARealCompany',
        'yearCreated' : new Date().getFullYear(),
        'baseUrl' : 'http://localhost:3000/'
    }
};

// PRODUCTION
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisISalsoAsecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    },
    'templateGlobals' : {
        'appName' : 'UptimeChecker',
        'companyName' : 'NotARealCompany',
        'yearCreated' : new Date().getFullYear(),
        'baseUrl' : 'http://localhost:5000/'
    }
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// CHECK THAT CURRENT ENVIRONMENT MATCHES, ELSE IT'S STAGING
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// EXPORT MODULE
module.exports = environmentToExport;