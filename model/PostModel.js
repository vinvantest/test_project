'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var PostModel = new Schema
(
    {
        id              : ObjectId,
        postDate        : { type: Date, required: true, default: Date.now},
        title           : { type: String, required: true},
        postCatNumber   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        postType        : { type: String, required: true, enum: ['general', 'public', 'private'], default: 'public'},
        comments        : [{ type: mongoose.Schema.types.ObjectId, ref: 'CommentModel'}],
        postedBy        : { type: mongoose.Schema.types.ObjectId, ref: 'UserModel'}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);

PostModel.plugin(mongoosePaginate);
PostModel.plugin(uniqueValidator,{ message: 'Error - PostModel, api expects {PATH} to be unique.'});
PostModel.plugin(mongooseHistory);

var PostModel = mongoose.model('posts', PostModel);

module.exports = PostModel;
