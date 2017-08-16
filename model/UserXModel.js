'use strict';

var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserXSchema = new Schema({
      name          : {
                        type: String,
                        required: true,
                        es_indexed: true
                      },
      email         : String,
      city          : {
                        type: String,
                        required: true,
                        es_indexed: true
                      }
    },
    {timestamps: { createdAt: 'created_at_hist', updatedAt: 'updated_at_hist' }},
    { runSettersOnQuery: true }
  );

 UserXSchema.plugin(uniqueValidator,{ message: 'Error - UserXSchema, api expects {PATH} to be unique.'});
 UserXSchema.plugin(mongooseHistory);
 UserXSchema.plugin(deepPopulate);
 UserXSchema.plugin(mongoosastic, {
  hosts: ['https://4e63bcdd9a8f759833dc274a950eea17.ap-southeast-2.aws.found.io:9243'],
  //process.env.ELASTICSEARCH_URL, //	https://4e63bcdd9a8f759833dc274a950eea17.ap-southeast-2.aws.found.io:9243
  auth: 'vinvan_pict@yahoo.com:gnNCK6c62EgAUMtZpWfDxRyP'
});

var UserXModel = mongoose.model('users_x', UserXSchema);
module.exports = UserXModel;

UserXModel.createMapping(function (err,mapping)
  {
        if(err){
        console.log('error creating mapping in UserXModel (you can safely ignore this)');
        console.log(err);
      }else{
        console.log('UserXModel mapping created!');
        console.log(mapping);
        }
  }
);

    var stream = UserXModel.synchronize();
    var count = 0;

    stream.on('data', function(){
      count++
    });

    stream.on('close', function(){
      console.log('indexed whisks ' + count + " documents");
    });

    stream.on('error', function(){
    });
