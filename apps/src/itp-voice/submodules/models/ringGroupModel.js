/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RingGroupSchema = new Schema({
    resources:  Array,
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    name: String
});

mongoose.model('RingGroup', RingGroupSchema);