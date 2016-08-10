/**
 * Created by Lucas on 22/12/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
    date_message:  {
        type: Date, default: Date.now
    },
    caller_id: { type : String},
    duration: {type: String},
    recording : {type : String},
    id_mailbox: Schema.Types.ObjectId,
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Message', MessageSchema);