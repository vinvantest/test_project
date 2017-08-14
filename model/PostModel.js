'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
var deepPopulate = require('mongoose-deep-populate')(mongoose)

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PostModel = new Schema
(
    {
        id              : ObjectId,
        postTitle       : { type: String, required: true},
        postCatNumber   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        postedBy        : { type: ObjectId, ref: 'users'}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }},
    { runSettersOnQuery: true }
);

PostModel.plugin(mongoosePaginate);
PostModel.plugin(uniqueValidator,{ message: 'Error - PostModel, api expects {PATH} to be unique.'});
PostModel.plugin(mongooseHistory);
PostModel.plugin(deepPopulate);

var PostModel = mongoose.model('posts', PostModel);

module.exports = PostModel;
