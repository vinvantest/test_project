'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');
var mongooseHistory = require('mongoose-history');
var deepPopulate = require('mongoose-deep-populate')(mongoose)

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema
(
    {
        id              : ObjectId,
        first_name      : { type: String, required: true},
        last_name       : { type: String, required: true},
        email_address   : { type: String, index: true, required: true, unique: true, uniqueCaseInsensitive: true, lowercase: true}, //Setters are not executed by default in 4.x. For example, if you lowercase emails in your schema:
        career          : { type: String, required: true, enum: ['student', 'professional', 'business'], default: 'business'},
        age             : { type: Number, min: 18, max: 80, default: 21},
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }},
    { runSettersOnQuery: true }
    /*
    //Setters are not executed by default in 4.x. For example, if you lowercase emails in your schema:
    var personSchema = new Schema({
                                email: {
                                    type: String,
                                    lowercase: true
                                  }
                                });
    //Mongoose will not automatically lowercase the email in your queries, so Person.find({ email: 'Val@karpov.io' })
    // would return no results. Use the runSettersOnQuery option to turn on this behavior:
    var personSchema = new Schema({
                                    email: {
                                      type: String,
                                      lowercase: true
                                    }
                                  }, { runSettersOnQuery: true });
    */
);

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(uniqueValidator,{ message: 'Error - UserModel, api expects {PATH} to be unique.'});
UserSchema.plugin(mongooseHistory);
UserSchema.plugin(deepPopulate);

var UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
