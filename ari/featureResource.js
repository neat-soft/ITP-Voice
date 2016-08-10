
var events = require('events'),
    featureResource = new events.EventEmitter(),
    Q = require('q'),
    config = require("./config/config"),
    request = require('request'),
    SoundsController = require('./soundsController'),
    Api = require("./api"),
    soundsController = new SoundsController(),
    api = new Api();


featureResource.TAG = "featureResource";
featureResource.agentLoggedIn = function (client, incoming) {
    soundsController.createBook("you-are-now-logged-in-to-all-your-queues") //TODO: add this to the config file
        .then(function (file) {
            var playLoggedIn = client.Playback();
            incoming.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/itp/' + file.name}, //TODO: add this to the config file
                playLoggedIn, function (err, playLoggedIn) {
                    if (err) {
                        throw err;
                    }
                });
            playLoggedIn.once('PlaybackFinished', function (event, instance) {
                incoming.hangup(function (err) {
                    if (err)
                        throw err;
                    console.log("hang up agent after login");
                });
            });
        });
};
featureResource.agentLoggedOut = function (client, incoming) {
    soundsController.createBook("you-are-now-logged-out-from-all-your-queues") //TODO: add this to the config file
        .then(function (file) {
            var playLoggedOut = client.Playback();
            incoming.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/itp/' + file.name}, //TODO: add this to the config file
                playLoggedOut, function (err, playLoggedOut) {
                    if (err) {
                        throw err;
                    }
                });
            playLoggedOut.once('PlaybackFinished', function (event, instance) {
                incoming.hangup(function (err) {
                    if (err)
                        throw err;
                    console.log("hang up agent after logout");
                });
            });
        });

};

featureResource.hande1FeatureCode = function (data, client, account) {
    console.log("digti hold/unhold", data);
    var holdId = data.holdId;
    var direction = data.direction;
    var json = {
        holdID: holdId,
        direction: direction
    };
    console.log("Json :", json);
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call' + config.apiKey;
    request({
        "rejectUnauthorized": false,
        "url": url,
        "method": "POST",
        headers: {
            "content-type": "application/json"
        },
        json: json
    }, function (error, response, activeCall) {
        if(activeCall){
            console.log("activeCall: ", activeCall);
            if (typeof activeCall == 'string')
                activeCall = JSON.parse(activeCall);
            if (direction === "outgoing"){
                var channelId = activeCall.from_id;
            }else if (direction === "incoming"){
                var channelId = activeCall.to_id;
            }
            var json = {
                code: data.digits,
                account: activeCall.account
            };
            var onPlaybackFinished = function (event) {
                var channelId = event.playback.id;
                console.log("event", event);
                var data = {channelId: channelId, variable: "keepPlaying"};
                client.channels.getChannelVar(
                    data, function (err, keepPlaying) {
                        console.log("Err : ",err);
                        if(err === null){
                            var value = keepPlaying.value;
                            if (value === "true") {
                                var media = event.playback.media_uri;
                                startPlayBack(channelId, media);
                            } else {
                                console.log("on playback finsihed called by unhold, do nothing");
                            }
                        }
                    });
            };
            var endPlayBack = function (channelId) {
                console.log("ChannelID :", channelId);
                client.playbacks.stop({playbackId: channelId}, function (err) {});
            };
            var startPlayBack = function (channelId, media) {
                var data = {channelId: channelId, media: media, playbackId: channelId};
                client.channels.play(
                    data, function (err, playback) {
                        playback.once("PlaybackFinished", onPlaybackFinished);
                    });
            };
            var resultFC = featureResource.getActionByCode(json, activeCall.account);
            resultFC.then(function (fCode) {
                ////
                //var media = "sound:hello-world";
                var ressource = fCode.resource;
                console.log(ressource);
                var bridgeId = activeCall.bridgeId;
                var ifHold = activeCall.hold;
                if(ressource !== undefined || ressource != null){
                    if (fCode.action == 'hold' && !ifHold ) {
                        api.downloadMoh(ressource)
                            .then(function (file) {
                                //var media = 'sound:' + '/var/lib/asterisk/sounds/en/voice.itpscorp/' + file.name;
                                var media = 'sound:demo-congrats';
                                console.log("Media :", media);
                                var data = {channelId: channelId, variable: "keepPlaying", value: "true"};
                                client.channels.setChannelVar(data, function (err, variable) {});
                                data = {bridgeId: bridgeId, channel: channelId};
                                console.log("data Channel ID:", data);
                                client.bridges.removeChannel(data)
                                    .then(function () {
                                        startPlayBack(channelId, media);
                                        featureResource.updateActiveCall(activeCall, "true", account);
                                    }).catch(function (error) {
                                    console.log("Remove channel Error: ", error);
                                });
                            });
                    } else if(fCode.action == 'unhold' && ifHold) {
                        console.log("trying to unhold");
                        var data = {channelId: channelId, variable: "keepPlaying", value: "false"};
                        /* TODO: we are sorry to say that we do not have enough knowledge to
                        explain why we need to stop the playback two times
                         */
                        client.playbacks.stop({playbackId: channelId}, function (err) {
                            data = {bridgeId: bridgeId, channel: channelId};
                            client.bridges.addChannel(data)
                                .then(function () {
                                    console.log("Add channel: ", channelId);
                                    endPlayBack(channelId);
                                    featureResource.updateActiveCall(activeCall, "false", account);
                                }).catch(function (error) {
                                console.log("Add channel Error: ", error);
                            });
                        });
                    }
                }
            },function (error){
                console.log(error);
            });
        }
    });
};

featureResource.updateActiveCall = function(callLogs, hold, account) {
    var id = callLogs._id;
    var json = {
        from_id: callLogs.from_id,
        to_id: callLogs.to_id,
        from_uri: callLogs.from_uri,
        to_uri: callLogs.to_uri,
        bridgeId: callLogs.bridgeId,
        hold: hold
    };
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call/updateActiveCall/' + id + config.apiKey;
    request({
        "rejectUnauthorized": false,
        "url": url,
        "method": "POST",
        headers: {
            "content-type": "application/json"
        },
        json: json
    }, function (error, response, cLogs) {
        if(error)
            console.log("Error Update");
        else
            console.log("update Active Call :", cLogs)
    });
};
featureResource.getActionByCode = function (data, account) {
    var deferred = Q.defer();
    console.log("digit: ", data);
    //TODO: update the following url
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/featureCode/getFeatureCode/' + config['apiKey'];
    request({
        "rejectUnauthorized": false,
        "url": url,
        "method": "POST",
        headers: {
            "content-type": "application/json"
        },
        json: data
    }, function (error, response, fCode) {
        console.log("fcode ", fCode);
        if (fCode !== '' && fCode !== null) {
            if (typeof fCode == 'string')
                fCode = JSON.parse(fCode);
            if (error) {
                console.log("error ", error);
                deferred.reject(error);
            } else {
                deferred.resolve(fCode);
            }
        }
    });
    return deferred.promise;
};

module.exports = featureResource;