/**
 * Created by Lucas on 15/07/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BillSettingSchema = new Schema({
    billingAddress: {type: String},
    mailingAddress: {type: String},
    lastInvoiceDate: {type: String},
    eBilling: {type: Boolean},
    automaticPayments : {type: Boolean},
    creditCardNumber:{type: String},
    account : {type: String}
});
// TODO: add realm

mongoose.model('BillSetting', BillSettingSchema);