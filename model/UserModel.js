var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-pages');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var UserSchema = new Schema
(
    {
        id              : ObjectId,
        first_name      : String,
        last_name       : String,
        email_address   : String,
        career          : String
    }
);

UserSchema.plugin(mongoosePaginate);

var UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
