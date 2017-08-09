'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
//var UserModel = require('../model/UserModel.js');

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
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);

MixRefModel.plugin(mongoosePaginate);
MixRefModel.plugin(uniqueValidator,{ message: 'Error - MixRefModel, api expects {PATH} to be unique.'});
MixRefModel.plugin(mongooseHistory);

var MixRefModel = mongoose.model('mixrefs', MixRefModel);

module.exports = MixRefModel;
