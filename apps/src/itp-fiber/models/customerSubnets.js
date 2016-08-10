/**
 * Created by Lucas on 12/07/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var customerSubnets = new Schema({
    sub_subnetid: Number,
    subnet: String,
    firstip: String,
    lastip : String,
    numberofhosts: Number,
    broadcastip: String,
    networkip: String
});

mongoose.model('CustomerSubnets', customerSubnets);