/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    UserSchema = require('./../../users/models/userModel'),
    Schema = mongoose.Schema;

var AccountSchema = new Schema({
    name: {type: String, required: true, unique: true},
    enabled: Boolean,
    key: {type: String, required: true},
    role: {type: String},
    //
    website: {type: String},
    email: {type: String},
    type: { type: String, enum: ['Residential', 'Business','Business Enterprise'] },
    accountNumber: {type: String},
    numberOfEmployees: {type: Number},
    netTerms: {type: Number},
    accountStatus: { type: String, enum: ['Active', 'Suspended','Terminated'] },
    realm: {type: String}
});
// TODO: add realm

mongoose.model('Account', AccountSchema);