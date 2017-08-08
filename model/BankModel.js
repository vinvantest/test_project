'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var BankModel = new Schema
(
    {
        id              : ObjectId,
        amount          : { type: Number, required: true},
        currency        : { type: String, required: true},
        accountNumber   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        bankName        : { type: String, required: true},
        accountName     : { type: String, required: true, default: ''},
        accountType     : { type: String, required: true, enum: ['cheque', 'savings', 'credit'], default: 'savings'},
        bankUserId      : { type: Schema.types.ObjectId, ref: 'UserModel'}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);

BankModel.plugin(mongoosePaginate);
BankModel.plugin(uniqueValidator,{ message: 'Error - BankModel, api expects {PATH} to be unique.'});
BankModel.plugin(mongooseHistory);

var BankModel = mongoose.model('transactions', BankModel);

module.exports = BankModel;
