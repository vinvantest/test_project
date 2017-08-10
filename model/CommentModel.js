'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var CommentModel = new Schema
(
    {
        id              : ObjectId,
        commentDate     : { type: Date, required: true, default: Date.now},
        commentString   : { type: String, required: true},
        commentProfile  : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        commentedBy     : { type: ObjectId, ref: 'users'},
        postTitleRef    : {type: ObjectId, ref: 'posts'}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }},
    { runSettersOnQuery: true }
);

CommentModel.plugin(mongoosePaginate);
CommentModel.plugin(uniqueValidator,{ message: 'Error - CommentModel, api expects {PATH} to be unique.'});
CommentModel.plugin(mongooseHistory);

var CommentModel = mongoose.model('comments', CommentModel);

module.exports = CommentModel;
