/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MailBoxSchema = new Schema({
    number: { type: Number },
    name: { type: String },
    password: { type: String },
    greeting: { type: String },
    userId: { type: Schema.Types.ObjectId },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('MailBox', MailBoxSchema);