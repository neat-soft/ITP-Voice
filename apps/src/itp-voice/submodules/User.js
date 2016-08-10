/**
 * Created by Lucas on 27/11/15.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    id: { type: String, unique:true },
    role: String,
    email: { type: String, required: true, unique: true }
});

var User = mongoose.model('User', userSchema);

module.exports = User;