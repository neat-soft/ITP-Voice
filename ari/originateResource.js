var events = require('events');
var originateResource = new events.EventEmitter();
var Q = require('q');
var config = require("./config/config");
var request = require('request');
var fs = require('fs');
var restler = require('restler');
var uuid = require('uuid');
var Api = require("./api");
var api = new Api();

originateResource.TAG = "originateResource";

originateResource.endEvent = "originate:end";
originateResource.start = function (client, event, channel, module, type) {
    console.log("Module: ", module);
    console.log("TYPE from start originate resource: ", type);
    console.log("start module originate", JSON.stringify(module), type);
    originateResource.originateRG(client, channel, module, type);
};
originateResource.addUpdateCdr = function (from, to, jsonReq, account) {
    var deferred = Q.defer();
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/callLog/updateOrAddCallLog/' + from + "/" + to + config['apiKey'];
    console.log("Update Cdr: ", url, jsonReq);
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        json: jsonReq
    }, function (err, response, cdr) {
        if (err) {
            console.log("Error from addUpdateCdr", err);
            deferred.resolve(err);
        } else {
            console.log("Add Update CDR result: ", cdr);
            deferred.resolve(cdr);
        }
    });
    return deferred.promise;
};
originateResource.getCdr = function (from, account) {
    var deferred = Q.defer();
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/callLog/getCallLogByFrom/' + from + config['apiKey'];
    console.log("Get Cdr: ", url);
    request({
        url: url,
        method: "GET"
    }, function (err, response, cdr) {
        if (err) {
            console.log("Error from getCdr", err);
            deferred.resolve(err);
        } else {
            console.log("Get CDR result: ", cdr);
            deferred.resolve(cdr);
        }
    });
    return deferred.promise;
};
originateResource.addActiveCall = function (json, account) {
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call/addActiveCall' + config.apiKey;
    console.log("Add Active Call: ", url);
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        json: json
    });
};
originateResource.deleteActiveCall = function (from, to, account) {
    if (from !== undefined && to !== undefined) {
        var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/active-call/deleteActiveCall/' + from + '/' + to + config.apiKey;
        console.log("Delete Active call: ", url);
        request({
            url: url,
            method: "DELETE",
            headers: {
                "content-type": "application/json"
            }
        });
    } else {
        console.log("no active call to delete !");
    }
};
originateResource.getExternalBySip = function (sip, callee, account) {
    var deferred = Q.defer();
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/device/external' + config.apiKey;
    var data = {
        sip: sip,
        callee: callee
    };
    request({
        url: url,
        method: "POST",
        json: data
    }, function (err, response, external) {
        if (err) {
            console.log("Error from getExternalBySip", err);
            deferred.resolve(err);
        } else {
            deferred.resolve(external);
        }
    });
    return deferred.promise;
};
originateResource.getDevice = function (sip, account) {
    var deferred = Q.defer();
    var url = config['app_host'] + ':' + config['app_port'] + '/accounts/' + account + '/device' + config.apiKey;
    var data = {username: sip};
    console.log(url);
    request({
        url: url,
        method: "POST",
        json: data
    }, function (err, response, device) {
        if (err) {
            console.log("Error from getDevice", err);
            deferred.resolve(err);
        } else {
            console.log("External originateResource", device);
            deferred.resolve(device);
        }
    });
    return deferred.promise;
};
originateResource.executeRR = function (client, incoming, module, account) {
    var moduleArr;
    if (Array.isArray(module))
        moduleArr = module;
    else
        moduleArr = [module];
    if (moduleArr != null && moduleArr !== [undefined] && moduleArr.length != 0) {
        var modulItem = moduleArr[0].numbers[0];
        originateResource.removeAllListeners("originateResource:rrNoAnswer");
        originateResource.originateLoop(client, incoming, modulItem, account);
        originateResource.once("originateResource:rrNoAnswer", function (data) {
            moduleArr.push(moduleArr.shift());
            originateResource.executeRR(client, incoming, moduleArr);
        });
    }
};
originateResource.executeRG = function (client, incoming, modules, qName, caller, account) {
    var playback = client.Playback();
    var deferred = Q.defer();
    var i = 0;
    var modulesArr;
    if (modules !== "undefined") {
        if (Array.isArray(modules))
            modulesArr = modules;
        else
            modulesArr = [modules];
    } else {
        console.log("no agent is login");
    }
    console.log(modules, qName, caller);
    originateResource.originateRG(client, incoming, modulesArr, "queue", caller,account, false);
    originateResource.once("originateResource:rgAgentAnswered", function (data) {
        var clientAgent = {agent: data.agent, client: incoming.id, qname: qName};
        console.log("AgentAnswerd: ", clientAgent);
        originateResource.emit('originateResource:rgAgentStatusUpdate', clientAgent);
    });
    originateResource.removeAllListeners("originateResource:rgNoAnswer");
    originateResource.on("originateResource:rgNoAnswer", function (data) {
        i++;
        if (i == modulesArr.length) {
            originateResource.emit('originateResource:rgNoAnswerAll', data);
        }
    });
    originateResource.removeAllListeners("originateResource:rgClientHangUp");
    originateResource.on("originateResource:rgClientHangUp", function (data) {
        originateResource.emit('originateResource:rgClientLeave', data);
    });
};
originateResource.originateRG = function (client, incoming, module, type, caller, account, callback) {
    var playback = client.Playback();
    var eventID = uuid.v4();
    var outgoingID = null, to = null;
    var stop = true;
    var channels = [];

    incoming.play({media: 'tone:ring;tonezone=us'}, playback, function () {});
    var bridge = client.Bridge();
    bridge.create({type: 'mixing'}, function (err, bridge) {
        bridge.addChannel({channel: incoming.id}, function (err) {});
        var milliseconds = new Date().getTime();
        var name = milliseconds +"-"+ uuid.v4();
        bridge.record({name: name, format: 'wav', beep: true, ifExists: 'overwrite'}, function (err, liverecording) {
            liverecording.once('RecordingFinished',
                function (event, newRecording) {
                    var caller = incoming.caller.number;
                    console.log("finished recording", event, caller);
                    var result = originateResource.getDevice(caller, account);
                    result.then(function(devices) {
                        if (devices.length > 0) {
                            var device = devices[0];
                            var obj = {
                                name: name,
                                from: incoming.caller.number,
                                to: to,
                                type: type,
                                account: account
                            };
                            originateResource.uploadRecording(obj, account)
                        } else
                            console.log("Unable to upload Recording for device");
                    });
                });
        });
    });
    originateResource.on("originateResource-bridge-"+eventID, function (params) {
        to = params[0].sip_settings.sip.username;
        outgoingID = params[1];
        bridge.addChannel({channel: params[1]}, function (err) {
            if (err) {
                console.log("error add channel to bridge", err);
            } else {
                var updateCdr = {
                    bridged: Date.now(),
                    account: account
                };
                originateResource.addUpdateCdr(incoming.id, params[1], updateCdr, account);
                var activeCallToAdd = {
                    bridgeId: bridge.id,
                    hold: false,
                    account: account,
                    from_id: incoming.id,
                    to_id: params[1],
                    from_uri: incoming.caller.number,
                    to_uri: params[0].sip_settings.sip.username
                };
                originateResource.addActiveCall(activeCallToAdd, account);
            }
        });
        channels.forEach(function (element) {
            if (element !== params[1]) {
                client.channels.get({channelId: element},
                    function (err, channel) {
                        if (err) {
                            console.log("Error get channel bridge: ",element, err);
                        } else {
                            channel.hangup();
                        }
                    }
                );
            }
        });
        //TODO: clear event when necessary
    });
    originateResource.on("originateResource-stopPlayBack-"+eventID, function () {
        if(stop && playback){
            playback.stop()
                .then(function (err) {})
                .catch(function (err) {console.log(err)});
            stop = false;
        }
        //TODO: clear event when necessary
    });
    originateResource.on("originateResource-originate-"+eventID, function (params) {
        channels.push(params[1]);
        originateResource.addUpdateCdr(incoming.id, params[1], params[0], account);
    });
    originateResource.on("originateResource-incomingEnd-"+eventID, function (params) {
        originateResource.addUpdateCdr(params[0], params[1], params[2], account);
        for (var j = 0; j < channels.length; j++) {
            client.channels.get({channelId: channels[j]},
                function (err, channel) {
                    if (err) {
                        console.log("Error get channel incomingEnd: ", err);
                    } else {
                        channel.hangup();
                    }
                }
            );
        }
    });
    originateResource.on("originateResource-outgoingEnd-"+eventID, function (params) {
        originateResource.addUpdateCdr(params[0].id, params[1].id, params[2], account)
            .then(function(result){
                originateResource.getCdr(params[0].id, account)
                    .then(function(result) {
                        var count = 0;
                        var ifBridged = false;
                        if (typeof result == 'string')
                            result = JSON.parse(result);
                        for (var i = 0; i < result.length; i++) {
                            if (!("ended" in result[i]))
                                count = count + 1;
                            if ("bridged" in result[i])
                                ifBridged = true;
                        }
                        if (ifBridged) {
                            params[0].hangup();
                        }
                        else
                        if( count <= 0) {
                            params[0].hangup();
                        }
                    }, function(err){
                        console.log("Error to get cdr: ", err);
                    })
            }, function(err) {
                console.log("Error to add update cdr: ", err);
            });
        //var indexID = channels.indexOf(params[3]);
        if(outgoingID === params[3]){
            client.bridges.removeChannel(
                {bridgeId: bridge.id, channel: incoming.id},
                function (err) {
                    if(err)
                        console.log("Error removeChennel outgoingEnd", err);}
            );
        }
    });
    if (type === "ringGroup") {
        // TODO: add loop
        for(var i = 0; i< module.length; i++){
            if(module[i].type === "device")
                originateResource.originateOnNet(client, bridge, incoming, module[i], caller, eventID, type, account, callback);
            else if(module[i].type === "number")
                originateResource.originateOffNet(client, bridge, incoming, module[i], caller, eventID, account, callback);
        }
    } else if(type === "device") {
        originateResource.originateOnNet(client, bridge, incoming, module, caller, eventID, type, account, callback);
    } else if(type === "offNet") {
        originateResource.originateOffNet(client, bridge, incoming, module, caller, eventID, account, callback);
    } else if(type === "queue"){
        module.forEach( function (moduleItem, indexModule, array) {
            moduleItem.numbers.forEach( function (numberItem, indexNum, arrayNum) {
                var number = {
                    sip_settings: {
                        sip: numberItem.sip_settings.internal.sip
                    }
                };
                originateResource.originateOnNet(client, bridge, incoming, number, caller, eventID, type, account);
            });
        });
    }
    if (callback){
        var modulesArr;
        if (module !== "undefined") {
            if (Array.isArray(module))
                modulesArr = module;
            else
                modulesArr = [module];
        } else {
            console.log("no agent is login");
        }
        originateResource.once("originateResource:rgAgentAnswered", function (data) {
            var clientAgent = {agent: data.agent, client: data.channel, qname: 'QueueBeta', removeNumber: data.removeNumber};
            console.log("AgentAnswerd: ", clientAgent);
            originateResource.emit('originateResource:rgAgentStatusUpdate', clientAgent);
        });
        originateResource.removeAllListeners("originateResource:rgNoAnswer");
        originateResource.on("originateResource:rgNoAnswer", function (data) {
            i++;
            if (i == modulesArr.length) {
                originateResource.emit('originateResource:rgNoAnswerAll', data);
            }
        });
        originateResource.removeAllListeners("originateResource:rgClientHangUp");
        originateResource.on("originateResource:rgClientHangUp", function (data) {
            originateResource.emit('originateResource:rgClientLeave', data);
        });
    }
};
originateResource.originateLoop = function (client, incoming, moduleItem, account) {
    var outgoing = client.Channel();
    var digits = [], dates = [], timer = null, numberHold;
    var stop = true;
    var playback = client.Playback();

    api.getRandomSbc(account)
        .then( function(sbc) {
            if (typeof sbc == 'string')
                sbc = JSON.parse(sbc);
            var endpoint = config.technology + moduleItem.sip_settings.sip.username + '@' + sbc.address;
            var data = {endpoint: endpoint, app: 'voicelinx.itpscorp', appArgs: 'dialed'};

            incoming.play({media: 'tone:ring;tonezone=us'}, playback, function () {});
            outgoing.originate(data, function (err, channel) {
                if (err) {
                    throw err;
                } else {
                    moduleItem.channel_id = channel.id;
                    /** Add Cdrs **/
                    var callLogToAdd = {
                        from_uri: incoming.caller.number,
                        to_uri: moduleItem.sip_settings.sip.username,
                        account: account,
                        received: Date.now()
                    };
                    originateResource.addUpdateCdr(incoming.id, moduleItem.channel_id, callLogToAdd, account);
                }
            });
            var bridge = client.Bridge();

            outgoing.once('StasisStart', function (event, outgoing) {
                console.log("Outgoing StasisStart: ", event);
                if(stop){
                    playback.stop();
                    stop = false;
                }
                var updateCdr = {
                    answered: Date.now(),
                    account: account
                };
                originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                var json = {
                    bridgeId: bridge.id,
                    hold: false,
                    from_id: incoming.id,
                    to_id: moduleItem.channel_id,
                    from_uri: incoming.caller.number,
                    to_uri: moduleItem.sip_settings.sip.username
                };
                originateResource.addActiveCall(json, account);
                bridge.create({type: 'mixing'}, function (err, bridge) {
                    bridge.addChannel({channel: [incoming.id, outgoing.id]}, function (err) {
                        if (err) {
                            console.log("ERROR ADD CHANNEL: ", err);
                            throw err;
                        } else {
                            var event = {channelState: "answered", agent: moduleItem, channel: outgoing.id};
                            originateResource.emit('originateResource:rrAgentStatusUpdate', event);
                            var updateCdr = {
                                bridged: Date.now(),
                                account: account
                            };
                            originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                        }
                    });
                });
            });
            /*   DTMf  */
            incoming.on('ChannelDtmfReceived',
                function (event, channel) {
                    console.log("Outgoing ChannelDtmfReceived: ", event);
                    if (typeof digits == 'string') {
                        digits = [];
                    }
                    if (timer != null) {
                        if (digits.indexOf(event.digit) > -1) {
                            return
                        } else {
                            digits.push(event.digit);
                        }
                    } else {
                        digits.push(event.digit);
                        dates.push(date);
                        timer = setTimeout(validateDTMF, 2000);
                    }
                    numberHold = event.channel.caller.number;
                }, function (error) {
                    console.log("Error Incoming channelDTMF: ", error);
                });

            /*   DTMf  */
            outgoing.on('ChannelDtmfReceived',
                function (event, channel) {
                    console.log("Outgoing ChannelDtmfReceived: ", event);
                    if (typeof digits == 'string') {
                        digits = [];
                    }
                    var dateEvent = new Date(event.timestamp);
                    var hours = dateEvent.getHours(),
                        minutes = dateEvent.getMinutes(),
                        seconds = dateEvent.getSeconds();
                    var date = hours + ":" + minutes + ":" + seconds;
                    var digit = parseInt(event.digit);
                    if (timer != null) {
                        if (dates.indexOf(date) > -1) {
                            return
                        } else {
                            dates.push(date);
                            digits.push(event.digit);
                        }
                    } else {
                        digits.push(event.digit);
                        dates.push(date);
                        timer = setTimeout(validateDTMF, 2000);
                    }
                    numberHold = event.channel.connected.number;
                }, function (error) {
                    console.log("Error Outgoing channelDTMF: ", error);
                });

            function validateDTMF() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                digits = digits.join('');
                var jsonHoldUnhold =
                {
                    digits: digits,
                    numberHold: numberHold
                };
                console.log("Emit: ", jsonHoldUnhold);
                originateResource.emit('originateResource:fcHoldUnHold', jsonHoldUnhold);
            }

            /*incoming/outgoing channel end*/
            incoming.once('StasisEnd', function (event, channel) {
                console.log("Incoming StasisEnd: ", event);
                if(stop){
                    playback.stop();
                    stop = false;
                }
                //var event = {channelState: "rrClientHangUp", agent: moduleItem, channel: outgoing.id};
                //originateResource.emit('originateResource:rrClientHangUp', event);
                channel.hangup()
                    .then(function (err) {})
                    .catch(function (err) {});
                client.bridges.removeChannel({bridgeId: bridge.id, channel: outgoing.id}, function (err) {
                    if (err) {
                        console.log("round robin err remove bridge", err);
                    } else {
                        var updateCdr = {
                            ended: Date.now(),
                            account: account
                        };
                        originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                        originateResource.deleteActiveCall(incoming.id, outgoing.id, account);
                    }
                });
                bridge.destroy(function (err) {});
                outgoing.hangup(function (err) {});
            });
            outgoing.once('StasisEnd', function (event, channel) {
                console.log("Outgoing StasisEnd: ", event);
                if(stop){
                    playback.stop();
                    stop = false;
                }
                client.bridges.removeChannel({bridgeId: bridge.id, channel: incoming.id},function (err) {
                    if (err) {
                        console.log("round robin err remove bridge", err);
                    } else {
                        var updateCdr = {
                            ended: Date.now(),
                            account: account
                        };
                        originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                        originateResource.deleteActiveCall(incoming.id, outgoing.id, account);
                    }
                });
                bridge.destroy(function (err) {});
                incoming.hangup(function (err) {});
            });
            outgoing.once('ChannelDestroyed', function (event, channel) {
                console.log("Outgoing ChannelDestroyed: ", event);
                if(stop){
                    playback.stop();
                    stop = false;
                }
                client.bridges.removeChannel(
                    {bridgeId: bridge.id, channel: incoming.id},
                    function (err) {}
                );
                if ( event.channel.state == 'Ringing' || event.cause_txt === "Unallocated (unassigned) number") {
                    var event = {channelState: "rrNoAnswer", agent: moduleItem, channel: outgoing.id};
                    originateResource.emit('originateResource:rrNoAnswer', event);
                } else if (event.cause_txt == "Normal Clearing" && event.channel.state == "Up") {
                    var event = {channelState: "rrClientHangUp", agent: moduleItem, channel: outgoing.id};
                    originateResource.emit('originateResource:rrClientHangUp', event);
                }
            });
            incoming.once('ChannelDestroyed', function (event, channel) {
                console.log("Incoming ChannelDestroyed: ", event);
                if(stop){
                    playback.stop();
                    stop = false;
                }
                outgoing.hangup(function (err) {
                });
            });
        });
};
originateResource.originateOnNet = function (client, bridge, incoming, number, caller, eventID, type, account, callback) {
    var outgoing = client.Channel();
    var digits = [], dates = [], timer = null, holdId, direction;
    var callerNumber = (caller!= null && caller !== undefined)?caller:incoming.caller.number;
    if(callback){
        var json = {
            number: number.sip_settings.sip.username,
            clientId: outgoing.id,
            account: account,
            nameQ: "QueueBeta"
        };
        api.updateClientQ(json, account);
    }
    api.getRandomSbc(account)
        .then( function(sbc) {
            if (typeof sbc == 'string')
                sbc = JSON.parse(sbc);
            var endpoint = config.technology + number.sip_settings.sip.username + '@' + sbc.address;
            var data = {endpoint: endpoint, app: 'voicelinx.itpscorp', appArgs: 'dialed', callerId:callerNumber};

            incoming.once('StasisEnd', function (event, channel) {
                console.log("Incoming StasisEnd: ",event);
                var updateCdr = {
                    ended: Date.now(),
                    account: account
                };
                var params = [incoming.id, outgoing.id, updateCdr];
                originateResource.emit("originateResource-stopPlayBack-"+eventID);
                originateResource.emit("originateResource-incomingEnd-"+eventID, params);
                originateResource.deleteActiveCall(incoming.id, outgoing.id, account);
            });

            outgoing.originate(data, function (err, channel) {
                if (err) {
                    throw err;
                } else {
                    var callLogToAdd = {
                        from_uri: incoming.caller.number,
                        to_uri: number.sip_settings.sip.username,
                        received: Date.now(),
                        account: account
                    };
                    var params = [callLogToAdd, outgoing.id];
                    originateResource.emit("originateResource-originate-"+eventID, params);
                }
            });

            incoming.once('StasisStrat', function (event, channel) {
                if(callback){
                    var event = {
                        channelState: "answered",
                        agent: {
                            sip_settings: {
                                sip: {
                                    username: incoming.caller.number
                                }
                            }
                        },
                        removeNumber: number.sip_settings.sip.username,
                        channel: outgoing.id
                    };
                    console.log("event in Start: ", event);
                    originateResource.emit('originateResource:rgAgentAnswered', event);
                }
            });

            incoming.on('ChannelDtmfReceived', function (event, channel) {
                console.log("Incoming ChannelDtmfReceived: ",event);
                if (typeof digits == 'string') {
                    digits = [];
                }
                var dateEvent = new Date(event.timestamp);
                var hours = dateEvent.getHours(),
                    minutes = dateEvent.getMinutes(),
                    seconds = dateEvent.getSeconds();
                var date = hours + ":" + minutes + ":" + seconds;
                if (timer != null) {
                    if (dates.indexOf(date) > -1) {
                        return
                    } else {
                        dates.push(date);
                        digits.push(event.digit);
                    }
                } else {
                    digits.push(event.digit);
                    dates.push(date);
                    holdId = channel.id;
                    direction = "incoming";
                    timer = setTimeout(validateDTMF, 2000);
                }
            }, function (error) {
                if (error)
                    console.log("Error channelDTMF:", error);
            });

            outgoing.on('ChannelDtmfReceived', function (event, channel) {
                console.log("Outgoing ChannelDtmfReceived: ",event);
                if (typeof digits == 'string') {
                    digits = [];
                }
                var dateEvent = new Date(event.timestamp);
                var hours = dateEvent.getHours(),
                    minutes = dateEvent.getMinutes(),
                    seconds = dateEvent.getSeconds();
                var date = hours + ":" + minutes + ":" + seconds;
                var digit = parseInt(event.digit);
                if (timer != null) {
                    if (dates.indexOf(date) > -1) {
                        return
                    } else {
                        dates.push(date);
                        digits.push(event.digit);
                    }
                } else {
                    digits.push(event.digit);
                    dates.push(date);
                    holdId = channel.id;
                    direction = "outgoing";
                    timer = setTimeout(validateDTMF, 2000);
                }
            }, function (error) {
                console.log("Error channelDTMF:", error);
            });

            function validateDTMF() {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                digits = digits.join('');
                var json =
                {
                    digits: digits,
                    holdId: holdId,
                    direction: direction
                };
                originateResource.emit('originateResource:fcHoldUnHold', json);
            }

            outgoing.once('ChannelDestroyed', function (event, channel) {
                console.log("Outgoing ChannelDestroyed: ",event);
                var updateCdr = {
                    ended: Date.now(),
                    account: account
                };
                var params = [incoming, outgoing, updateCdr, channel.id];
                originateResource.emit("originateResource-outgoingEnd-"+eventID, params);
                originateResource.emit("originateResource-stopPlayBack-"+eventID);
                if (type === "queue"){
                    if ((event.cause_txt == 'Unknown' && event.channel.state == 'Ringing')
                        || event.cause_txt == 'User busy'
                        || (event.cause_txt == 'Call Rejected' && event.channel.state == "Ringing")
                        || (event.cause_txt == 'Normal Clearing' && event.channel.state == "Ringing")) {
                        var evt = {
                            channelState: "rgNoAnswer",
                            agent: number,
                            channel: outgoing.id
                        };
                        originateResource.emit('originateResource:rgNoAnswer', evt);
                    } else if (event.cause_txt == "Normal Clearing" && event.channel.state == "Up") {
                        var evt = {
                            channelState: "rgClientHangUp",
                            agent: number,
                            channel: outgoing.id
                        };
                        originateResource.emit('originateResource:rgClientHangUp', evt);
                    }
                }else{
                    if (event.cause_txt == 'User busy'
                        || (event.cause_txt == 'Call Rejected' && event.channel.state == "Ringing")
                        || (event.cause_txt == 'Normal Clearing' && event.channel.state == "Ringing")
                        || (event.cause_txt == 'Unknown' && event.channel.state == 'Ringing')
                        || (event.cause_txt == 'No user responding' && event.channel.state == 'Ringing')) {
                        var data = {
                            channel: incoming.id
                        };
                        originateResource.emit('originateResource:noAnswer', data);
                    }
                }
                if (callback){
                    if ((event.cause_txt == 'Unknown' && event.channel.state == 'Ringing')
                        || event.cause_txt == 'User busy'
                        || (event.cause_txt == 'Call Rejected' && event.channel.state == "Ringing")
                        || (event.cause_txt == 'Normal Clearing' && event.channel.state == "Ringing")) {
                        var evt = {
                            channelState: "rgNoAnswer",
                            agent: {
                                sip_settings: {
                                    sip: {
                                        username: incoming.caller.number
                                    }
                                }
                            },
                            channel: incoming.id
                        };
                        originateResource.emit('originateResource:rgNoAnswer', evt);
                    } else if (event.cause_txt == "Normal Clearing" && event.channel.state == "Up") {
                        var evt = {
                            channelState: "rgClientHangUp",
                            agent: {
                                sip_settings: {
                                    sip: {
                                        username: incoming.caller.number
                                    }
                                }
                            },
                            channel: incoming.id
                        };
                        originateResource.emit('originateResource:rgClientHangUp', evt);
                    }
                }
            });

            outgoing.once('StasisEnd', function (event, channel) {
                console.log("Outgoing StasisEnd: ", event);
                originateResource.emit("originateResource-stopPlayBack-"+eventID);
                if (event.cause_txt == 'User busy'
                    || (event.cause_txt == 'Call Rejected' && event.channel.state == "Ringing")
                    || (event.cause_txt == 'Normal Clearing' && event.channel.state == "Ringing")
                    || (event.cause_txt == 'Unknown' && event.channel.state == 'Ringing')
                    || (event.cause_txt == 'No user responding' && event.channel.state == 'Ringing')) {
                    var data = {
                        channel: incoming.id
                    };
                    originateResource.emit('originateResource:noAnswer', data);
                }
            });

            outgoing.once('StasisStart', function (event, outgoing) {
                console.log("Outgoing StasisStart: ", event);
                originateResource.emit("originateResource-stopPlayBack-"+eventID);
                originateResource.emit("originateResource-bridge-"+eventID, [number, outgoing.id]);
                var updateCdr = {
                    answered: Date.now(),
                    account: account
                };
                originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                if(type === "queue"){
                    var event = {
                        channelState: "answered",
                        agent: number,
                        removeNumber: incoming.caller.number,
                        channel: incoming.id
                    };
                    originateResource.emit('originateResource:rgAgentAnswered', event);
                }
                if(callback){
                    var event = {
                        channelState: "answered",
                        agent: {
                            sip_settings: {
                                sip: {
                                    username: incoming.caller.number
                                }
                            }
                        },
                        removeNumber: number.sip_settings.sip.username,
                        channel: outgoing.id
                    };
                    originateResource.emit('originateResource:rgAgentAnswered', event);
                }
            });
        });
};
originateResource.originateOffNet = function (client, bridge, incoming, number, caller, eventID, account, callback) {
    var callee = number.number;
    var sip = incoming.caller.number;
    if(callback){
        var json = {
            number: number.sip_settings.sip.username,
            clientId: outgoing.id,
            account: account,
            nameQ: "QueueBeta"
        };
        api.updateClientQ(json, account);
    }
    api.getRandomSbc(account)
        .then( function (sbc) {
            var result = originateResource.getExternalBySip(sip, callee, account);
            result.then(function (externalNumber) {
                if (typeof sbc == 'string')
                    sbc = JSON.parse(sbc);
                var endpoint = config.technology + callee + '@' + sbc.address;
                var data = {endpoint: endpoint, app: 'voicelinx.itpscorp', appArgs: 'dialed',  callerId: externalNumber};
                var outgoing = client.Channel();
                outgoing.originate(data, function (err, channel) {
                    if (err) {
                        throw err;
                        console.log("error while originating: ", err);
                    }
                    number.channel_id = channel.id;
                    var callLogToAdd = {
                        from_uri: incoming.caller.number,
                        to_uri: callee,
                        account: account,
                        received: Date.now()
                    };
                    var params = [callLogToAdd, outgoing.id];
                    originateResource.emit("originateResource-originate-"+eventID, params);
                });
                outgoing.once('StasisStart', function (event, outgoing) {
                    console.log("Outgoing StasisStart: ", event);
                    originateResource.emit("originateResource-stopPlayBack-"+eventID);
                    var numberObj = {sip_settings: {sip: {username: number.number}}};
                    originateResource.emit("originateResource-bridge-"+eventID, [numberObj, outgoing.id,]);
                    var updateCdr = {
                        answered: Date.now(),
                        account: account
                    };
                    originateResource.addUpdateCdr(incoming.id, outgoing.id, updateCdr, account);
                    if(callback){
                        var event = {
                            channelState: "answered",
                            agent: {
                                sip_settings: {
                                    sip: {
                                        username: incoming.caller.number
                                    }
                                }
                            },
                            removeNumber: number.sip_settings.sip.username,
                            channel: outgoing.id
                        };
                        originateResource.emit('originateResource:rgAgentAnswered', event);
                    }
                });

                incoming.once('StasisStart', function (event, channel) {
                    if (callback){
                        event = {
                            channelState: "answered",
                            agent: {
                                sip_settings: {
                                    sip: {
                                        username: incoming.caller.number
                                    }
                                }
                            },
                            removeNumber: number.sip_settings.sip.username,
                            channel: outgoing.id
                        };
                        originateResource.emit('originateResource:rgAgentAnswered', event);
                    }
                });

                incoming.once('StasisEnd', function (event, channel) {
                    console.log("Incoming StasisEnd: ", event);
                    var event = {channelState: "rrClientHangUp", agent: number, channel: outgoing.id};
                    var updateCdr = {ended: Date.now(), account: account};
                    var params = [incoming.id, outgoing.id, updateCdr];
                    originateResource.emit('originateResource:rrClientHangUp', event);
                    originateResource.emit("originateResource-stopPlayBack-"+eventID);
                    originateResource.emit("originateResource-incomingEnd-"+eventID, params);
                    originateResource.deleteActiveCall(incoming.id, outgoing.id, account);

                });

                incoming.once('ChannelDestroyed', function (event, channel) {
                    console.log("Incoming ChannelDestroyed: ", event);
                    if( callback) {
                        if ((event.cause_txt == 'Unknown' && event.channel.state == 'Ringing')
                            || event.cause_txt == 'User busy'
                            || (event.cause_txt == 'Call Rejected' && event.channel.state == "Ringing")
                            || (event.cause_txt == 'Normal Clearing' && event.channel.state == "Ringing")) {
                            var evt = {
                                channelState: "rgNoAnswer",
                                agent: {
                                    sip_settings: {
                                        sip: {
                                            username: incoming.caller.number
                                        }
                                    }
                                },
                                channel: incoming.id
                            };
                            originateResource.emit('originateResource:rgNoAnswer', evt);
                        } else if (event.cause_txt == "Normal Clearing" && event.channel.state == "Up") {
                            var evt = {
                                channelState: "rgClientHangUp",
                                agent: {
                                    sip_settings: {
                                        sip: {
                                            username: incoming.caller.number
                                        }
                                    }
                                },
                                channel: incoming.id
                            };
                            console.log("Evt: ", evt);
                            originateResource.emit('originateResource:rgClientHangUp', evt);
                        }
                    }
                });

                outgoing.once('StasisEnd', function (event, channel) {
                    console.log("Outgoing StasisEnd: ", event);
                    originateResource.emit("originateResource-stopPlayBack-"+eventID);
                    var updateCdr = {
                        ended: Date.now(),
                        account: account
                    };
                    var params = [incoming, outgoing, updateCdr, channel.id];
                    originateResource.emit("originateResource-outgoingEnd-"+eventID, params);
                    //incoming.hangup();
                });
            });
        });
};
originateResource.uploadRecording = function (obj, account) {
    var nameForm = obj.name + '.wav';
    fs.stat('/var/spool/asterisk/recording/'  + nameForm, function (err, stats) {
        console.log("uploadRecording:", err, stats);
        if(err){
            console.log("Error to upload Recording");
        }else {
            var url = config["app_host"] + ':' + config["app_port"] + '/accounts/' + account + '/recording/add-record' + config.apiKey;
            restler.post(url, {
                multipart: true,
                data: {
                    "filename": nameForm,
                    "from": obj.from,
                    "to": obj.to,
                    "audio": restler.file('/var/spool/asterisk/recording/' + nameForm, null, stats.size, null, "audio/wav"),
                    "type": obj.type,
                    "account": obj.account
                }
            }).on("complete", function (data) {
                console.log('Recording upload completed ', data);
            });
        }
    });
};

module.exports = originateResource;
