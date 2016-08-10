/**
 * Created by root on 12/05/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BrandProvisionerSchema = new Schema({
    brand: {type: String},
    model: {type:String},
    family: {type: String},
    template: {type: Object}
});

mongoose.model('brandProvisioners', BrandProvisionerSchema);