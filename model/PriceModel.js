'use strict';

var mongoose = require('mongoose');
//var mongoosastic = require('mongoosastic');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PriceSchema = new Schema({
  products: {
    type        : ObjectId,
    ref         : 'products',
    //es_schema   : ProductSchema,
    //es_indexed  : true,
    //es_select   : 'description brand category type'
  },
  stores: {
    type        : ObjectId,
    ref         : 'stores',
    //es_schema   : StoreSchema,
    //es_indexed  : true,
    //es_select   : 'name local'
  },
  price         : Number,
  created_at    : {type : Date, default : Date.now}
});

var PriceModel = mongoose.model('prices', PriceSchema);

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

module.exports = PriceModel;
