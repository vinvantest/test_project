'use strict';

var restify = require('restify');
var plugins = require('restify-plugins');
var restifyValidator = require('restify-validator');
var logger = require('./config/logger.js');
var server = restify.createServer();
var setupController = require('./controllers/setupController.js');
var routerController = require('./controllers/routerController.js');
var mongoose = require('mongoose');

//logger.log('debug', 'setupController loading...');
setupController(server, restify, plugins, restifyValidator);
//logger.log('debug', 'setupController completed...');

/* ****
SETUP Database - Mongoose
*/

//logger.log('debug', 'dbConnection loading...');

// Build the connection string
var dbURI = 'mongodb://dev1:test1234@ds127173.mlab.com:27173/buzrecdb';

// Create the database connection
//logger.log('info', 'In DBConnection Module - opening mongoose connection');
//mongoose.Promise = global.Promise;
//const db = mongoose.createConnection(dbURI,function(error)
mongoose.Promise = global.Promise;
mongoose.connect(dbURI,function(error)
    {
        logger.log('info', "Mongoose open function done  " + mongoose.connection.host + " " + mongoose.connection.port);
        if(error)
        {
            logger.log('error', "Error in Mongoose Connect" + error);
        }else
        {
          //continue with the server listening & routing
            //logger.log('info', 'no errors in opening mongoose.connect');
            //logger.log('debug', 'dbConnection completed...');

            //logger.log('debug', 'routerController loading...');
            routerController(server);
            //logger.log('debug', 'routerController completed');

            server.listen(8888, function() {
              console.log('%s listening at %s', server.name, server.url);
            });
        }
    }
);

//mongoose.connect(dbURI);
//logger.log('info', 'In DBConnection Module - connection made' + db);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function ()
{
 //console.log('Mongoose default connection open to ' + dbURI);
 logger.log('info', 'Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error',function (err)
{
  //console.log('Mongoose default connection error: ' + err);
  logger.log('error', 'Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function ()
{
  //console.log('Mongoose default connection disconnected');
  logger.log('error', 'Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function()
{
  mongoose.connection.close(function ()
  {
    //console.log('Mongoose default connection disconnected through app termination');
    logger.log('error', 'Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

/*
* DB Connection to Mongoose completed
**/
