/**
 * Created by youssef on 29/07/16.
 */
var events = require('events');
var path = require('path');
var config = require("./../config/config");
var RecordingState = require('./states/recordingState');
var EndingState = require('./states/endingState');
var HangUpState = require('./states/hangupState');
var StateMachine = require('./states/stateMachine');
var ReviewingState = require('./states/reviewingState');
var Event = require('./events');
var voicemailMachine = new events.EventEmitter();

voicemailMachine.process = function (client, channel, mailBox) {
    var vm_path = path.join('voicemail', Date.now().toString());
    client.channels.get({channelId: channel.id})
        .then(function (channelVM) {
            var call = {};
            call.channel = channelVM;
            call.client = client;
            call.vm_path = vm_path;
            call.mailBox = mailBox;
            var hangupState = new HangUpState(call);
            var recordingState = new RecordingState(call);
            var endingState = new EndingState(call);
            var reviewingState = new ReviewingState(call);
            call.state_machine = new StateMachine();
            call.state_machine.add_transition(recordingState, Event.DTMF_OCTOTHORPE, reviewingState);
            call.state_machine.add_transition(recordingState, Event.HANGUP, hangupState);
            call.state_machine.add_transition(recordingState, Event.DTMF_STAR, recordingState);
            call.state_machine.add_transition(reviewingState, Event.DTMF_OCTOTHORPE, endingState);
            call.state_machine.add_transition(reviewingState, Event.HANGUP, hangupState);
            call.state_machine.add_transition(reviewingState, Event.DTMF_STAR, recordingState);
            call.state_machine.start(recordingState);
        }, function (error) {
            console.log("error from voicemailMachine", error);
        });
};
module.exports = voicemailMachine;