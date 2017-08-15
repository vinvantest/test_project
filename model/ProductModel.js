'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

    var ProductSchema = new Schema({
      description   : String,
      brand         : String,
      category      : String,
      type          : String,
      picture       : String
    });

var ProductModel = mongoose.model('products', ProductSchema);

module.exports = ProductModel;
