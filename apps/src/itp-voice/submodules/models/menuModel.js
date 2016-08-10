/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MenuSchema = new Schema({
    options : [{
        digit: {type: Number, min: 0},
        sound: {type: String},
        module: Schema.Types.ObjectId,
        type: {type: String}
    }],
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('Menu', MenuSchema);