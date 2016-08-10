/**
 * Created by Lucas on 22/12/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MohSchema = new Schema({
   filename:  {
        type: String
    },
    audio: {
        type : String
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Moh', MohSchema);