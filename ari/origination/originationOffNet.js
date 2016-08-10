/**
 * Created by Lucas on 21/07/16.
 */
var Q = require('q');
var uuid = require('uuid');
var events = require('events');
var config = require("./../config/config");
var Api = require('./../api');
var api = new Api();
originationOffNet = new events.EventEmitter();

originationOffNet.process = function (client, incoming, module, caller, account, outgoingID, eventID) {
    var toURI = module;
    var bridge = client.Bridge();
    bridge.create({type: 'mixing'}, function (err, bridge) {
        bridge.addChannel({channel: incoming.id}, function (err) {
        });
        var milliseconds = new Date().getTime();
        var name = milliseconds + "-" + uuid.v4();
        bridge.record({name: name, format: 'wav', beep: true, ifExists: 'overwrite'}, function (err, liverecording) {
            liverecording.once('RecordingFinished',
                function (event) {
                    var caller = incoming.caller.number;
                    console.log("finished recording", event, caller);
                    var result = api.getDevice(caller, account);
                    result.then(function (devices) {
                        if (devices.length > 0) {
                            var device = devices[0];
                            var obj = {
                                name: name,
                                from: incoming.caller.number,
                                to: toURI,
                                type: "offNet",
                                account: account
                            };
                            api.uploadRecording(obj, account)
                        } else
                            console.log("Unable to upload Recording for device");
                    });
                });
        });
    });
    incoming.once('StasisEnd', function (event) {
        console.log("Incoming StasisEnd: ", event);
        var updateCdr = {ended: Date.now(), account: account};
        api.addUpdateCdr(incoming.id, outgoingID, updateCdr, account);
        client.channels.get({channelId: outgoingID},
            function (err, channel) {
                if (err) {
                    console.log("Error get channel incomingEnd: ", err);
                } else {
                    channel.hangup();
                }
            }
        );
        api.deleteActiveCall(incoming.id, outgoingID, account);

    });
    originationOffNet.on("originationOffNet-bridge-" + eventID, function () {
        console.log("Inside originationOffNet-bridge");
        bridge.addChannel({channel: outgoingID}, function (err) {
            if (err) {
                console.log("error add channel to bridge", err);
            } else {
                console.log("Channel Bridged");
                originationOffNet.emit("originationOffNet:stopPlayback-" + eventID);
                originationOffNet.emit('originationOffNet:killOthers-' + eventID, outgoingID);
                var updateCdr = {
                    bridged: Date.now(),
                    account: account
                };
                api.addUpdateCdr(incoming.id, outgoingID, updateCdr, account);
                var activeCallToAdd = {
                    bridgeId: bridge.id,
                    hold: false,
                    account: account,
                    from_id: incoming.id,
                    to_id: outgoingID,
                    from_uri: incoming.caller.number,
                    to_uri: toURI
                };
                api.addActiveCall(activeCallToAdd, account);
            }
        });
    });

    originationOffNet.on("originationOffNet-outgoingEnd-" + eventID, function (params) {
        api.addUpdateCdr(incoming.id, outgoingID, params, account)
            .then(function () {
                api.getCdr(incoming.id, account)
                    .then(function (cdr) {
                        for(var i= 0, check=false ; i<cdr.length ; i++)
                            if ("bridged" in cdr[i])
                                check = true;
                        if (check)
                            incoming.hangup()
                                .catch(function () {
                                    console.log("apparently incoming is dead");
                                });
                        else{
                            //TODO: Next step
                        }
                    }, function (err) {
                        console.log("error to get cdr: ", err);
                    })
            })
    });
    originationOffNet.originateOffNet(client, bridge, incoming, module, caller, account, outgoingID, eventID);
};
originationOffNet.originateOffNet = function (client, bridge, incoming, number, caller, account, outgoingID, eventID) {
    var sip = incoming.caller.number;
    api.getRandomSbc(account)
        .then(function (sbc) {
            var result = api.getExternalBySip(sip, number, account);
            result.then(function (externalNumber) {
                if (typeof sbc == 'string')
                    sbc = JSON.parse(sbc);
                var endpoint = config.technology + number + '@' + sbc.address;
                var data = {
                    channelId: outgoingID,
                    endpoint: endpoint,
                    app: 'voicelinx.itpscorp',
                    appArgs: 'dialed',
                    callerId: externalNumber
                };
                client.channels.originateWithId(data, function (err, outgoing) {
                    if (err) {
                        console.log("error while originating: ", err);
                        throw err;
                    } else {
                        var callLogToAdd = {
                            from_uri: incoming.caller.number,
                            to_uri: number,
                            account: account,
                            received: Date.now()
                        };
                        api.addUpdateCdr(incoming.id, outgoingID, callLogToAdd, account);

                        outgoing.once('StasisStart', function (event) {
                            console.log("Outgoing StasisStart: ", event);
                            var updateCdr = {
                                answered: Date.now(),
                                account: account
                            };
                            api.addUpdateCdr(incoming.id, outgoingID, updateCdr, account);
                            originationOffNet.emit("originationOffNet-bridge-" + eventID);
                        });

                        outgoing.once('ChannelDestroyed', function (event) {
                            console.log("Outgoing ChannelDestroyed: ", event);
                            var updateCdr = {
                                ended: Date.now(),
                                account: account
                            };
                            originationOffNet.emit("originationDevice-outgoingEnd-" + eventID, updateCdr);
                        });
                    }
                });
            });
        });
};

module.exports = originationOffNet;