/**
 * Created by youssef on 29/07/16.
 */
var Q = require('q');
var events = require('events');
var originationResource = require('./../origination/originationResource');
var voicemailMachine = require('./voiceMailMachine');
voiceMailResource = new events.EventEmitter();

voiceMailResource.processVoiceMail = function (client, channel, voiceMail, daemonID) {
    originationResource.emit('originationResource:stopPlayback-' + daemonID);
    switch(voiceMail.action){
        case "record":
            voicemailMachine.process(client, channel, voiceMail.mailBox);
            break;
        default:
            originationResource.emit("originationResource:nextStep-" + daemonID);
            break;
    }
};

module.exports = voiceMailResource;