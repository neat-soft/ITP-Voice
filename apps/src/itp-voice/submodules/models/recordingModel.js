/**
 * Created by Lucas on 13/04/16.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecordingSchema = new Schema({
    filename: {
        type: String
    },
    resource: {
        from : {type : String},
        to : {type : String}
    },
    type: {
        type: String
    },
    gfs_id: {
        type : String
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Recording', RecordingSchema);