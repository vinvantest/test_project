'use strict';

const logger = require('../config/logger.js');

module.exports = function(server, restify, plugins, restifyValidator)
{
  server.use(plugins.acceptParser(server.acceptable));
  server.use(plugins.queryParser());
  server.use(plugins.bodyParser({ mapParams: true }));
  server.use(restifyValidator);
  //logger.log('debug', 'In setupController module - server.use completed');

                                //dev, short, tiny
  server.use(require('morgan')('combined',
  {
    stream:
    {
      write: message =>
      {
        logger.log('info', message);
      }
    }
  }));

  //logger.log('debug', 'In setupController module - server.use morgan completed');

}
