'use strict';

// load settings from the environment (BlueMix Specific)
const cfenv = require('cfenv');
const appEnv = cfenv.getAppEnv();
const PORT = parseInt(process.env.PORT || appEnv.port || 3000);
const Client = require('../lib/client').Client;

// load required packages
const loopback   = require('loopback');
const morgan     = require('morgan');
const helmet     = require('helmet');
const glob       = require('glob');

// create our server app
const app = loopback();

// configure NODE_ENV
app.env = process.env.NODE_ENV || 'development';

// load-in middleware
app.use(helmet());                                    // general security
app.use('/', loopback.static(__dirname + '/public')); // serve static assets

if (app.env !== 'test') {
  app.use(morgan('combined'));                        // request logging
}

// load in our API methods from the `api` directory
glob(__dirname + '/api/**/*.js', function(error, files) {
  if (error) { throw error; }
  files.forEach(function(file) {
    require(file)(app);
  });
});

// boot the server
const boot = function(env, callback){
  app.server = app.listen(PORT, function() {

    app.clients = {
      index: `${app.env}-kaiser-locations`,
      elasticsearch: new Client(env).configure(),
    };

    console.log(`*** Server running on port ${PORT} in ${app.env} ***`);
    console.log(`connecting to elasticsearch index \`${app.clients.index}\``)

    if(typeof callback === 'function'){ return callback(null, app); }
  });
};

if(require.main === module){ boot(); }

module.exports = boot;
