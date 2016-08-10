/**
 * Created by Lucas on 21/07/16.
 */
var Q = require('q');
var uuid = require('uuid');
var events = require('events');
var originationDevice = require('./originationDevice');
var originationOffNet = require('./originationOffNet');
var originationGroup = new events.EventEmitter();
var outgoings = {};

originationGroup.fireListeners = function (client, incoming, originationID, userID, eventID) {
    originationDevice.on('originationDevice:stopPlayback-'+eventID, function() {
        originationDevice.removeAllListeners('originationDevice:stopPlayback-'+eventID);
        originationOffNet.removeAllListeners('originationOffNet:stopPlayback-'+eventID);
        originationGroup.emit('originationGroup:stopPlayback-'+originationID);
    });
    originationOffNet.on('originationOffNet:stopPlayback-'+eventID, function() {
        originationDevice.removeAllListeners('originationDevice:stopPlayback-'+eventID);
        originationOffNet.removeAllListeners('originationOffNet:stopPlayback-'+eventID);
        originationGroup.emit('originationGroup:stopPlayback-'+originationID);
    });
    originationDevice.on('originationDevice:killOthers-'+eventID, function(channelID) {
        originationOffNet.removeAllListeners('originationOffNet:killOthers-'+eventID);
        originationDevice.removeAllListeners('originationDevice:killOthers-'+eventID);
        console.log("outgoings", outgoings);
        for(var i = 0; i < outgoings[incoming.id].length; i++) {
            if(outgoings[incoming.id][i] !== channelID) {
                client.channels.get({channelId: outgoings[incoming.id][i]})
                    .then(function(channel) {
                        if (channel !== undefined)
                            channel.hangup();
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        }
    });
    originationOffNet.on('originationOffNet:killOthers-'+eventID, function(channelID) {
        originationOffNet.removeAllListeners('originationOffNet:killOthers-'+eventID);
        originationDevice.removeAllListeners('originationDevice:killOthers-'+eventID);
        console.log("outgoings", outgoings);
        for(var i = 0; i < outgoings[incoming.id].length; i++) {
            if(outgoings[incoming.id][i] !== channelID) {
                client.channels.get({channelId: outgoings[incoming.id][i]})
                    .then(function(channel) {
                        if (channel !== undefined)
                            channel.hangup();
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            }
        }
    });
};

originationGroup.process = function (client, incoming, ringGroup ,caller, account, originationID){
    var deferred = Q.defer();
    console.log("in originationGroup");
    ringGroup.forEach(function(element) {
        if (outgoings[incoming.id] === undefined) {
            outgoings[incoming.id] = [];
        }
        var outgoingID = uuid.v4();
        outgoings[incoming.id].push(outgoingID);
        var userID = uuid.v4();
        var eventID = uuid.v4();
        originationGroup.fireListeners(client, incoming, originationID, userID, eventID);
        if(element.device_type === "sip_phone"){
            var device = element.sip_settings;
            console.log("Device: ", device);
            originationDevice.process(client, incoming, device, caller, account, outgoingID, eventID);
        }else if(element.device_type === "cell_phone"){
            var number = element.forward;
            console.log("Number: ", number);
            originationOffNet.process(client, incoming, number, caller, account, outgoingID, eventID);
        }else{
            console.log("Nothing to do here !!!!", element);
        }
    });
    return deferred.promise;
};

module.exports = originationGroup;