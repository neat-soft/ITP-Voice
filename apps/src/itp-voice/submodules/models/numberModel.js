/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NumberSchema = new Schema({
    number: { type: String, required: true},
    //state: String,
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    npa: {type: String},
    nxx: {type: String},
    ratecenter: {type: String},
    state: {type: String},
    use_caller_id: {type: Boolean}
});

mongoose.model('Number', NumberSchema);