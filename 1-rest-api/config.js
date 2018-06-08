// CREATE AND EXPORT CONFIGURATION VARIABLES

// CONTAINER FOR ALL ENVIRONMENTS
let environments = {};

// CONVENTION ON WEB PORTS FOR HTTP & HTTPS ARE:
// HTTP: 80
// HTTPS: 443

// STAGING
environments.staging = {
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging'
};

// PRODUCTION
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production'
};

const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// CHECK THAT CURRENT ENVIRONMENT MATCHES, ELSE IT'S STAGING
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// EXPORT MODULE
module.exports = environmentToExport;