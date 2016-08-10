/**
 * Created by Lucas on 12/07/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var itpSubnets = new Schema({
    subnetid: Number,
    subnet: String,
    CIDR: String,
    SubnetMask : String,
    subnetdescription: String
});

mongoose.model('ITPSubnets', itpSubnets);