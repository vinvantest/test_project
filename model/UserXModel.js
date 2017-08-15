'use strict';

var mongoose = require('mongoose');
//var mongoosastic = require('mongoosastic');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserXSchema = new Schema({
      name          : {
                        type: String,
                        required: true,
                        //es_indexed : true
                      },
      email         : String,
      city          : {
                        type: String,
                        required: true,
                        //es_indexed : true
                      }
    });

var UserXModel = mongoose.model('users_x', UserXSchema);

/*
UserXSchema.plugin(mongoosastic, {
  host: process.env.ELASTICSEARCH_URL,
  port: 9200
});
*/

module.exports = UserXModel;
