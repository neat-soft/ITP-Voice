/**
 * Created by root on 10/05/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SbcSchema = new Schema({
    name: {type: String},
    address: {type: String},
    description: {type: String}
});

mongoose.model('Sbc', SbcSchema);