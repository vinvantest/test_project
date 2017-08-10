'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var TransactionModel = new Schema
(
    {
        id              : ObjectId,
        amount          : { type: Number, required: true},
        currency        : { type: String, required: true},
        transactionDate : { type: Date, required: true, default: Date.now},
        accountNumber   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true},
        bankName        : { type: String, required: true},
        accountName     : { type: String, required: true, default: ''},
        accountType     : { type: String, required: true, enum: ['cheque', 'savings', 'credit'], default: 'savings'},
        isDebit         : { type: Boolean, required: true, default: false},
        paidToCompany   : { type: String, required: true, default: ''},
        transactionByUserId          : { type: Schema.types.ObjectId, ref: 'users'},
        bankAccountsOfUserId         : [{ type: Schema.types.ObjectId, ref: 'banks'}]
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }},
    { runSettersOnQuery: true }
);

TransactionModel.plugin(mongoosePaginate);
TransactionModel.plugin(uniqueValidator,{ message: 'Error - TransactionModel, api expects {PATH} to be unique.'});
TransactionModel.plugin(mongooseHistory);

var TransactionModel = mongoose.model('transactions', TransactionModel);

module.exports = TransactionModel;
