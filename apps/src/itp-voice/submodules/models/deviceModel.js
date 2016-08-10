/**
 * Created by Lucas on 30/11/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema({
    name: {type: String},
    mac_address: {type: String},
    sip_settings: {
        internal: { type: String},
        external: {type: String},
        sip: {
            username: {type: String},
            password: {type: String}
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    use_caller_id: {type: Boolean},
    match_area: {type: Boolean},
    follow_me: {
        enabled: {type: String},
        ring_strategy: {type: String},
        followme_numbers: [{type: String}]
    },
    outgoing_call_rules: [
        { rule_id: {type: String}}],
    account: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    forward: {type: String},
    type: {type: String}
    /*user_profile: {
     FirstName: {type: String},
     LastName: {type: String},
     DisplayName: {type: String},
     Location: {type: String},
     Title: {type: String},
     Language: {type: String},
     ProfilePicture: {type: String}
     },*/
});

mongoose.model('Device', DeviceSchema);