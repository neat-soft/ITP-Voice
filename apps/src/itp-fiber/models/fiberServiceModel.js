/**
 * Created by Lucas on 12/07/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FiberServiceSchema = new Schema({
    name: {
        type: String, 
        default: "ITP Fiber Internet Service"
    },
    accountid:{
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    deviceid: {
        type: Schema.Types.ObjectId,
        ref: 'FiberDevice'
    },
    speed : String,
    monthly_price: String,
    fiberswitchid: String,
    fiberswitchport: String
});

mongoose.model('FiberService', FiberServiceSchema);