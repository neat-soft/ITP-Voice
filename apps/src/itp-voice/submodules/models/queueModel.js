/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QueueSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    extension: {
        type:String,
        index: true
    },
    max_queue_size: {
        type : Number
    },
    welcome_message: {
        type : String,
        default: 'welcome-to-our-system'
    },
    moh : {
        type: Schema.Types.ObjectId
    },
    strategy : {
        type: String
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }

});

mongoose.model('Queue', QueueSchema);