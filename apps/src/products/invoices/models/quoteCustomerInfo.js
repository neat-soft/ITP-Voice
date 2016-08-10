/**
 * Created by Lucas on 12/07/17.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuoteCustomerInfo = new Schema({
    customerType : String,
    name: String,
    quoteStage: String,
    billingAddress : {
    	addressStreet: String,
        address_suit_pobox: String,
        city: String,
        state : String,
        zipCode: String
    },
    mailingAddress : {
    	addressStreet: String,
        address_suit_pobox: String,
        city: String,
        state : String,
        zipCode: String
    },
});

mongoose.model('QuoteCustomerInfo', QuoteCustomerInfo);