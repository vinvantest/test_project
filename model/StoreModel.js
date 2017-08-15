'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

    var StoreSchema = new Schema({
      name  : String,
      local : String
    });

var StoresModel = mongoose.model('stores', StoreSchema);

module.exports = StoresModel;
