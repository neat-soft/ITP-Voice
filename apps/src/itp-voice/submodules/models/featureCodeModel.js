/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeatureCodeSchema = new Schema({
    code: { type: String },
    action: { type: String },
    resource: { type: String },
    feature: { type: String },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('FeatureCode', FeatureCodeSchema);