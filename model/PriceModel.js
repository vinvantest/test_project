'use strict';

var mongoose = require('mongoose');
//var mongoosastic = require('mongoosastic');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PriceSchema = new Schema({
  products      : {type: ObjectId, ref: 'products' /*, es_schema: ProductSchema, es_indexed: true, es_select: 'description brand category type'*/},
  stores        : {type: ObjectId, ref: 'stores' /*, es_schema: StoreSchema, es_indexed: true, es_select: 'name local' */},
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

/*
PriceSchema.plugin(mongoosastic, {
  host: process.env.ELASTICSEARCH_URL,
  port: 9200,
  populate: [
    {path: 'products', select: 'description brand category type'},
    {path: 'stores', select: 'name local'}
  ]
});
*/

var PriceModel = mongoose.model('prices', PriceSchema);

module.exports = PriceModel;
