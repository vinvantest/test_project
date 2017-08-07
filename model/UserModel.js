var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');
var uniqueValidator = require('mongoose-unique-validator');

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
        isDeleted       : { type: Boolean, required: true, default: false}
    },
    {timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }}
);

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(uniqueValidator,{ message: 'Error, api expects {PATH} to be unique.'});

var UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
