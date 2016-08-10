/**
 * Created by Lucas on 31/12/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AgentQueueSchema = new Schema({
    agentId:  {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    queueId: {
        type: Schema.Types.ObjectId,
        ref: 'Queue',
        index: true
    },
    status: { type : String, default: 'logout' }

});

mongoose.model('AgentQueue', AgentQueueSchema);