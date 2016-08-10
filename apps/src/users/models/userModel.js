/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    devicesSchema = require('./../../itp-voice/submodules/models/deviceModel'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstName: { type: String},
    lastName: { type: String},
    displayName: { type: String},
    location: { type: String},
    title: { type: String},
    language: { type: String},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String},
    device : {
        type: Schema.Types.ObjectId,
        ref: 'Device'
    },
    status: { type: String, enum: ['incall', 'login','logout'] },
    profilePicture: { type: String },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('User', UserSchema);