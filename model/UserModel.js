'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema
(
    {
        id              : ObjectId,
        first_name      : { type: String, required: true},
        last_name       : { type: String, required: true},
        email_address   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        career          : { type: String, required: true, enum: ['student', 'professional', 'business'], default: 'business'},
        age             : { type: Number, min: 18, max: 80, default: 21},
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(uniqueValidator,{ message: 'Error - UserModel, api expects {PATH} to be unique.'});
UserSchema.plugin(mongooseHistory);

var UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
