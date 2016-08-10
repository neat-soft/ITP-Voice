/**
 * Created by youssef on 25/07/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GetSchema = new Schema({
    name: {type: String},
    url: {type : String},
    variable_name: {type: String},
    timeout: {type: String},
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Get', GetSchema);