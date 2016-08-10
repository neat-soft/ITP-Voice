/**
 * Created by Lucas on 15/07/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConstactSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    officePhone: {type: String},
    mobilePhone : {type: String},
    department : {type: String},
    typeOfContact  : {type: String, enum: ['User', 'Employee','TechnicalContact', 'AfterHours']},
    cLientPortalUsername : {type: String},
    clientPortalPassword : {type: String},
    cendBill : {type: Boolean},
    clientPortalAccessEnabled : {type: Boolean},
    caymentNotifications : {type: Boolean},
    account : {type: String}
});
// TODO: add realm

mongoose.model('Contact', ConstactSchema);