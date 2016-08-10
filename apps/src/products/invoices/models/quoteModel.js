/**
 * Created by Lucas on 12/07/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuoteSchema = new Schema({
    customerInfo:{
        type: Schema.Types.ObjectId,
        ref: 'QuoteCustomerInfo'
    },
    lineItems:{
        groups: [{
            groupName : String,
            products : [{
                quantity : Number,
                product : String,
                partNumber : String,
                list : Number,
                discount : Number,
                salePrice : Number,
                tax : Number,
                total : Number
            }],
            total : Number,
            discount : Number,
            subTotal : Number,
            tax : Number,
            grandTotal : Number
        }],
        total : Number,
        discount : Number,
        subTotal : Number,
        tax : Number,
        groupTotal : Number
    }
});

mongoose.model('Quotes', QuoteSchema);