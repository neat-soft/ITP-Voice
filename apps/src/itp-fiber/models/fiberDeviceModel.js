/**
 * Created by Lucas on 12/07/17.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FiberDeviceSchema = new Schema({
    name: {
        type: String, 
        default: "ITP Fiber CPE"
    },
    
    accountid: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    activatedDate: Date,
    circuitID : String,
    speed : String,
    model: String,
    monthly_price: String,
    asset_tag: String,
    serial_number: String,
    wan_mac_address: String,
    wan_ip_address: String,
    ssh_username: String,
    ssh_password:  String
});

mongoose.model('FiberDevice', FiberDeviceSchema);