'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
//var Pagnation = require('mongoose-sex-page');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var MixRefModel = new Schema
(
    {
        anyString        : { type: String, required: true},
        anyUniqueString  : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        commentsDataId     : { type: ObjectId, ref: 'comments'},
        postsDataId        : { type: ObjectId, ref: 'posts'}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }},
    { runSettersOnQuery: true }
);


MixRefModel.plugin(mongoosePaginate);
MixRefModel.plugin(uniqueValidator,{ message: 'Error - MixRefModel, api expects {PATH} to be unique.'});
MixRefModel.plugin(mongooseHistory);
MixRefModel.plugin(deepPopulate);

var MixRefModel = mongoose.model('mixrefs', MixRefModel);

module.exports = MixRefModel;
