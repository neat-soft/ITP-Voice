/**
 * Created by Lucas on 18/01/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActiveCallSchema = new Schema({
    from_id: {type: String, required: true},
    to_id: {type:String, required: true},
    from_uri: {type: String},
    to_uri: {type:String},
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    hold: {type:Boolean},
    bridgeId: {type:String}
});

mongoose.model('ActiveCall', ActiveCallSchema);