/**
 * Created by Lucas on 21/07/16.
 */
var Q = require('q');
var uuid = require('uuid');
var events = require('events');
var config = require("./../config/config");
var Api = require('./../api');
var api = new Api();
originationDevice = new events.EventEmitter();

originationDevice.process = function (client, incoming, module, caller, account, outgoingID, eventID) {
    var toURI = module.sip.username;
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
                                type: "device",
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
        originationDevice.removeAllListeners("originationDevice-outgoingEnd-" + eventID);
        var updateCdr = {
            ended: Date.now(),
            account: account
        };
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

    originationDevice.on("originationDevice-bridge-" + eventID, function () {
        bridge.addChannel({channel: outgoingID}, function (err) {
            if (err) {
                console.log("error add channel to bridge", err);
            } else {
                originationDevice.emit("originationDevice:stopPlayback-" + eventID);
                originationDevice.emit('originationDevice:killOthers-' + eventID, outgoingID);
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

    originationDevice.on("originationDevice-outgoingEnd-" + eventID, function (params) {
        api.addUpdateCdr(incoming.id, outgoingID, params, account)
            .then(function(){
                api.getCdr(incoming.id, account)
                    .then(function(cdr){
                        for(var i= 0, check=false ; i<cdr.length ; i++)
                            if ("bridged" in cdr[i])
                                check = true;
                        if (check) {
                            console.log("Do hangup");
                            incoming.hangup()
                                .catch(function () {
                                    console.log("apparently incoming is dead");
                                });
                        }
                        else{
                            //TODO: Next step
                            console.log("in Next step");
                            originationDevice.emit("originationDevice:nextStep-" + eventID);
                        }
                    }, function(err) {
                        console.log("error to get cdr: ", err);
                    })
            })
    });
    originationDevice.originateOnNet(client, bridge, incoming, module, caller, account, outgoingID, eventID);
};

originationDevice.originateOnNet = function (client, bridge, incoming, number, caller, account, outgoingID, eventID) {
    var callerNumber = (caller != null && caller !== undefined) ? caller : incoming.caller.number;
    api.getRandomSbc(account)
        .then(function (sbc) {
            if (typeof sbc == 'string')
                sbc = JSON.parse(sbc);
            var endpoint = config.technology + number.sip.username + '@' + sbc.address;
            var data = {
                channelId: outgoingID,
                endpoint: endpoint,
                app: 'voicelinx.itpscorp',
                appArgs: 'dialed',
                callerId: callerNumber
            };
            client.channels.originateWithId(data, function (err, outgoing) {
                if (err) {
                    throw err;
                } else {
                    var callLogToAdd = {
                        from_uri: incoming.caller.number,
                        to_uri: number.sip.username,
                        received: Date.now(),
                        account: account
                    };
                    api.addUpdateCdr(incoming.id, outgoingID, callLogToAdd, account);

                    outgoing.once('ChannelDestroyed', function (event) {
                        console.log("Outgoing ChannelDestroyed: ", event);
                        var updateCdr = {
                            ended: Date.now(),
                            account: account
                        };
                        originationDevice.emit("originationDevice-outgoingEnd-" + eventID, updateCdr);
                    });

                    outgoing.once('StasisStart', function (event) {
                        console.log("Outgoing StasisStart: ", event);
                        var updateCdr = {
                            answered: Date.now(),
                            account: account
                        };
                        api.addUpdateCdr(incoming.id, outgoingID, updateCdr, account);
                        originationDevice.emit("originationDevice-bridge-" + eventID);
                    });
                }
            });
        });
};

module.exports = originationDevice;