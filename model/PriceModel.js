'use strict';

var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var ProductSchema = require('../model/ProductModel.js');
var StoreSchema = require('../model/StoreModel.js');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PriceSchema = new Schema({
  products      : {type: ObjectId, ref: 'products', es_schema: ProductSchema, es_indexed: true, es_select: 'description brand category type'},
  stores        : {type: ObjectId, ref: 'stores', es_schema: StoreSchema, es_indexed: true, es_select: 'name local' },
  pricePoint    : {type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
  price         : {type: Number, index: true, required: true, unique: true},
  created_at    : {type : Date, default : Date.now}
},
{timestamps: { createdAt: 'created_at_hist', updatedAt: 'updated_at_hist' }},
{ runSettersOnQuery: true }
);

PriceSchema.plugin(uniqueValidator,{ message: 'Error - PriceModel, api expects {PATH} to be unique.'});
PriceSchema.plugin(mongooseHistory);
PriceSchema.plugin(deepPopulate);


PriceSchema.plugin(mongoosastic, {
  hosts: ['https://4e63bcdd9a8f759833dc274a950eea17.ap-southeast-2.aws.found.io:9243'],
  //process.env.ELASTICSEARCH_URL, //	https://4e63bcdd9a8f759833dc274a950eea17.ap-southeast-2.aws.found.io:9243
  //auth: 'vinvan_pict@yahoo.com:gnNCK6c62EgAUMtZpWfDxRyP',
  //httpAuth: 'elastic:gZnBSLQ5i1PWWWQJH2CZAVGL',
  httpAuth: 'vinvan_test:test1234',
  populate: [
    {path: 'products', select: 'description brand category type'},
    {path: 'stores', select: 'name local'}
  ]
});


var PriceModel = mongoose.model('prices', PriceSchema);

module.exports = PriceModel;

PriceModel.createMapping(function (err,mapping) {
        if(err){
        console.log('error creating mapping in PriceModel (you can safely ignore this)');
        console.log(err);
      }else{
        console.log('PriceModel mapping created!');
        console.log(mapping);
        doTheNextThing();
        }
    });


function doTheNextThing () {
    var stream = PriceModel.synchronize();
    var count = 0;

    stream.on('data', function(){
      count++
    });

    stream.on('close', function(){
      console.log('indexed whisks ' + count + " documents");
    });

    stream.on('error', function(){
    });
  }
