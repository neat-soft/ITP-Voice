/**
 * Created by youssef on 27/07/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IfSchema = new Schema({
    name: {type: String},
    expression: {type : String},
    execution_if_true: {
        id: {type:Schema.Types.ObjectId},
        type: {type: String}
    },
    execution_if_false: {
        id: {type:Schema.Types.ObjectId},
        type: {type: String}
    },
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    }
});

mongoose.model('If', IfSchema);