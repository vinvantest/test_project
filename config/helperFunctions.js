'use strict';

const logger = require('../config/logger.js');

 function _respond(res, next, status, data, http_code) {
  var response = {
    'status': status,
    'data' : data
  };
  res.setHeader('Content-type', 'application/json');
  res.writeHead(http_code);
  res.end(JSON.stringify(response));
}

module.exports.success = function success(res, next, data){
  _respond(res, next, 'success', data, 200);
}

module.exports.failure = function failure(res, next, data, http_code){
  logger.log('error', 'Error: ' + http_code + ' ' + data);
  _respond(res, next, 'failure', data, http_code);
}
