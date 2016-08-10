/**
 * Created by Lucas on 18/01/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CallLogSchema = new Schema({
    from_id: {type: String, required: true},
    to_id: {type:String, required: true},
    from_uri: {type: String},
    to_uri: {type:String},
    received:{ type : Date },
    ended:{ type : Date },
    bridged:{ type : Date},
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    answered:{ type : Date }
});

mongoose.model('CallLog', CallLogSchema);