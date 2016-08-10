/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IvrSchema = new Schema({
    //module:  {type: Schema.Types.ObjectId},
    module: {type: Array},
    numbers : {
        type: Schema.Types.ObjectId,
        ref: 'Number',
        index: true
    },
    //type: {type: String},
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Ivr', IvrSchema);