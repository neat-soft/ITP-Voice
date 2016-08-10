var events = require('events');
var config = require("./config/config");
var request = require('request');
var queueResource = new events.EventEmitter();
var originateResource = require('./originateResource');
var Q = require('q');
queueResource.TAG = "queueResource";
var SoundsController = require('./soundsController');
var soundsController = new SoundsController();
var uuid = require('uuid');
var fs = require('fs');
var rr = require('rr');
queueResource.endEvent = "queue:end";
var queues = {};


queueResource.needCallback = function(client, channel, agents, strategy){
    var deferred = Q.defer();
    console.log(agents);
    if(agents.length !== 0) { //todo: review this code
        setTimeout(function () {
            deferred.resolve(strategy);
        }, 0);
    }else{
        soundsController.createBook("no-free-agent-,-do-you-want-a-callback-?-press-one-for-yes-,-press-two-for-no")
            .then( function(file) {
                var playWelcome = client.Playback();
                channel.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/itp/' + file.name},
                    playWelcome, function (err, playWelcome) {
                        if (err) {
                            throw err;
                        }
                    });
            });
        client.on('ChannelDtmfReceived', function (event, channel) {
            console.log("client ChannelDtmfReceived: ",event);
            var dateEvent = new Date(event.timestamp);
            var dates = [], digits = [];
            var hours = dateEvent.getHours(),
                minutes = dateEvent.getMinutes(),
                seconds = dateEvent.getSeconds();
            var date = hours + ":" + minutes + ":" + seconds;
            var digit = parseInt(event.digit);
            if (dates.indexOf(date) > -1) {
                return
            } else {
                dates.push(date);
                digits.push(event.digit);
            }
            digits = digits.join('');
            switch (digits){
                case "1":
                    //client.removeListener('ChannelDtmfReceived');
                    deferred.resolve('callback');
                    break;
                case "2":
                    //client.removeAListener('ChannelDtmfReceived');
                    deferred.resolve('hold');
                    break;
            }
        }, function (error) {
            console.log("Error channelDTMF:", error);
        });
    }
    return deferred.promise;
};

//not Used
queueResource.start = function (client, event, channel, module, type) {
    console.log("########QUEUE MODDULE ###########: ", module);
    console.log("type: ", type);
    var welcome = module.welcome_message;
    var moh = module.moh;
    var strategy = module.strategy;
    queueResource.executeQ(client, event, channel, module, type, strategy, welcome, moh);
};
queueResource.downloadMoh = function (mohIid) {
    var deferred = Q.defer();
    var mohUrl = config['app_host'] + ':' + config['app_port'] + '/moh/' + mohIid;
    var nameFile = "voicelinx.itpscorp-" + uuid.v4();
    console.log(mohUrl);
    request
        .get(mohUrl)
        .on('error', function (err) {
            deferred.reject({
                "error": 500,
                "status": "unable to fetch file"
            });
        })
        .on('response', function (res) {
            var fileName = '/var/lib/asterisk/sounds/en/voice.itpscorp/' + nameFile + '.wav';
            res.pipe(
                fs.createWriteStream(fileName).
                    on('close', function () {
                        deferred.resolve({
                            "success": 200,
                            "name": nameFile
                        })
                    }).on('error', function (err) {
                        console.log("ERROR: ", err);
                    })
            );
        });
    return deferred.promise;
};
queueResource.updateAgentStatus = function (agentNumber, module, client, incoming) {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ module updateAgentStatus:$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", module);
    var deferred = Q.defer();
    var url = config['app_host'] + ':' + config['app_port'] + '/device/getDeviceByInternal/' + agentNumber;
    console.log(url);
    request(url, function (error, response, device) {
        if (typeof device == 'string')
            device = JSON.parse(device);
        var idDevice = device._id;
        var url = config['app_host'] + ':' + config['app_port'] + '/user/getUserByDevice/' + idDevice;
        console.log(device, url);
        request(url, function (error, response, user) {
            if (typeof user == 'string')
                user = JSON.parse(user);
            var idUser = user._id;
            var status = {
                "status": module.module.action
            };
            console.log("status: ", status, module.module.action);
            var url = config['app_host'] + ':' + config['app_port'] + '/agentQueue/updateStatusAgent/' + idUser + config.apiKey;
            request({
                url: url,
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                json: status
            }, function (err, response, agentQ) {
                if (err)
                    console.log(err);
                else {
                    console.log("===================>agent Queue updated: ", agentQ);
                    if (status.status === "login") {
                        var url = config['app_host'] + ':' + config['app_port'] + '/admin/getAllQueuesOfAgent/' + idUser;
                        console.log(url);
                        request(url, function (error, response, names) {
                            if (names !== null) {
                                if (typeof names == 'string')
                                    names = JSON.parse(names);
                                deferred.resolve(names);
                            }
                        });
                    }
                    if (incoming !== undefined) {
                        if (status.status === "login")
                            queueResource.agentLoggedIn(client, incoming);
                        else if (status.status === "logout")
                            queueResource.agentLoggedOut(client, incoming);
                    }
                }
            });

        });
    });
    return deferred.promise;
};
queueResource.lookupQAgents = function (client, clientChannel, nameQ, strategy) {
    var deferred = Q.defer();
    // Get Queue Id by name Queue
    var url = config['app_host'] + ':' + config['app_port'] + '/admin/getQueueByName/' + nameQ;
    request(url, function (error, response, queue) {
        if (typeof queue == 'string')
            queue = JSON.parse(queue);
        var idQ = queue._id;
        // Get logged in Agents in this queue
        var url = config['app_host'] + ':' + config['app_port'] + '/admin/getAQByQueueId/' + idQ;
        request(url, function (error, response, agentQs) {
            if (typeof agentQs === 'string')
                agentQs = JSON.parse(agentQs);
            if (strategy === 'ringall') {
                originateResource.executeRG(client, clientChannel, agentQs, "queue");
                originateResource.removeAllListeners("originateResource:rgAgentStatusUpdate");
                originateResource.once("originateResource:rgAgentStatusUpdate", function (data) {
                    var agentNumber = data.agent.sip_settings.internal;
                    var module = {
                        module: {
                            action: "incall"
                        }
                    };
                    queueResource.updateAgentStatus(agentNumber, module);
                    var qClient = data.client;
                    console.log("::::::::::::::::::::::::::::::::qClient queues length::::::::",queues[nameQ].clients.length);
                    if (queues[nameQ] != null && queues[nameQ].clients != null) {
                        for (var i = 0; i < queues[nameQ].clients.length; i++) {
                            if (qClient === queues[nameQ].clients[i].client) {
                                queues[nameQ].clients.splice(i, 1);
                                console.log("::::::::::::::::::::::::::::::::::::::::client removed", queues[nameQ].clients);
                            } else {
                                console.log("::::::::::::::::::::::::::::::::::::::::client not found in any queue");
                            }
                        }
                    } else {
                        console.log("queues Or clients Null", queues[nameQ].clients);
                    }
                    deferred.resolve({event: "answer"});
                });
                originateResource.once('originateResource:rgClientLeave', function (data) {
                    console.log("==============client hang up: ", data);
                    var agentNumber = data.agent.sip_settings.internal;
                    var module = {
                        module: {
                            action: "login"
                        }
                    };
                    queueResource.updateAgentStatus(agentNumber, module).then(function (qNames) {
                        for (var k = 0; k < qNames.length; k++) {
                            var qName = qNames[k];
                            console.log(":::::::::::qName::::::::::", qName, queues[qName], queues[qName].clients);
                            if ("clients" in queues[qName] && queues[qName].clients.length != 0 && queues[qName].clients != null) {
                                var qClient = queues[qName].clients[0];
                                console.log("qClient: ", qClient);
                                console.log("Agent update : :: ::: ::  :: :: ", qClient.client, qClient.nameQ, qClient.clientChannel, type);
                                if (qClient != null && qClient !== undefined) {
                                    queueResource.lookupQAgents(qClient.client, qClient.clientChannel, qClient.nameQ, qClient.strategy);
                                } else
                                    console.log("client null");
                            } else
                                console.log("no clients in the queue");
                        }
                    });
                });
                originateResource.removeAllListeners("originateResource:rgNoAnswerAll");
                originateResource.once('originateResource:rgNoAnswerAll', function (data) {
                    console.log("===================noAnswerAll==============", data);
                    if (data !== null && data.channelState == "rgNoAnswer") {
                        queues[nameQ].clients.push({
                            clientChannel: clientChannel,
                            client: client,
                            nameQ: nameQ,
                            strategy: strategy
                        });
                        console.log("queues add client : ", "clients: ", queues[nameQ].clients, queues[nameQ].clients.length);
                    }
                    deferred.resolve({event: "noanswer"});
                });
            } else if (strategy === 'roundrobin') {
                console.log("========================================> AgentQS",agentQs);
                if(agentQs !== null && agentQs !== 'undefined') {
                    var l = agentQs.length;
                    var tabAgentRR = [];
                    for (var i = 0; i < l; i++) {
                        var agentToCall = rr(agentQs);
                        tabAgentRR.push(agentToCall);
                    }
                    originateResource.executeRR(client, clientChannel, tabAgentRR);
                }
                originateResource.once("originateResource:rrAgentStatusUpdate", function (data) {
                    console.log("=========================EVENT : ", data);
                    var agentNumber = data.agent.sip_settings.internal;
                    var module = {
                        module: {
                            action: "incall"
                        }
                    };
                    queueResource.updateAgentStatus(agentNumber, module);
                    deferred.resolve({event: "answer"});
                });
                originateResource.once('originateResource:rrClientHangUp', function (data) {
                    console.log("========================================client hang up: ", data);
                    var agentNumber = data.agent.sip_settings.internal;
                    var module = {
                        module: {
                            action: "login"
                        }
                    };
                    queueResource.updateAgentStatus(agentNumber, module);
                });
            }
        });
    });

    return deferred.promise;
};
/* MOVED */
queueResource.handleClientAdd = function (client, nameQ, clientChannel, type, strategy, welcome, moh) {
    var deferred = Q.defer();
    console.log("in handleClientAdd", nameQ, welcome);
    soundsController.createBook(welcome)
        .then(function (file) {
            var playWelcome = client.Playback();
            console.log("file welcome: ", file);
            clientChannel.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/voice.itpscorp/' + file.name},
                playWelcome, function (err, playWelcome) {
                    if (err) {
                        throw err;
                    }
                });
            playWelcome.once('PlaybackFinished', function (event, instance) {
                var playMoh = client.Playback();
                queueResource.downloadMoh(moh)
                    .then(function (file) {
                        console.log("file: ", file);
                        mohName = file.name;
                        clientChannel.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/voice.itpscorp/' + mohName},
                            playMoh, function (err, playMoh) {
                                if (err) {
                                    throw err;
                                    console.log("error play music on hold: ", err);
                                }
                            });
                    });
                playMoh.once('PlaybackFinished', function (event, instance) {
                    deferred.resolve({event: "client-add"});
                });
            });
        }, function (error) {
            console.log("soundsController error:", error);
        });
    return deferred.promise;
};
queueResource.agentLoggedIn = function (client, incoming) {
    soundsController.createBook("you-are-now-logged-in-to-all-your-queues")
        .then(function (file) {
            var playLoggedIn = client.Playback();
            incoming.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/voice.itpscorp/' + file.name},
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
queueResource.agentLoggedOut = function (client, incoming) {
    soundsController.createBook("you-are-now-logged-out-from-all-your-queues")
        .then(function (file) {
            var playLoggedOut = client.Playback();
            incoming.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/voice.itpscorp/' + file.name},
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
queueResource.executeQ = function (client, event, incoming, module, type, strategy, welcome, moh) {
    if (typeof module == 'string')
        module = JSON.parse(module);
    console.log("module: ", module);
    var nameQ = module.name;
    console.log("nameQ: ", nameQ);
    if (!(nameQ in queues))
        queues[nameQ] = {};
    if (!("agents" in queues[nameQ]))
        queues[nameQ]["agents"] = [];
    if (!("clients" in queues[nameQ]))
        queues[nameQ]["clients"] = [];
    if (type === "featureCode") {
        var idQ = module._id;
        var internalCaller = event.channel.caller.number;
        if ((module !== null && module.module.action === "login")) {
            queueResource.updateAgentStatus(internalCaller, module, client, incoming).then(function (qNames) {
                console.log("= = = = = = == = = = qnames== == == == == = = = = = ", qNames, qNames.length, typeof qNames, type);
                for (var k = 0; k < qNames.length; k++) {
                    var qName = qNames[k];
                    console.log(":::::::::::qName::::::::::", qName);
                    if ("clients" in queues[qName] && queues[qName].clients.length != 0 && queues[qName].clients != null) {
                        console.log("client found in queue: ", qName);
                        var client = queues[qName].clients[0];
                        console.log("Agent update : :: ::: ::  :: :: ", client.client, client.nameQ, client.clientChannel, type, strategy, welcome, moh);
                        if (client != null && client !== "undefined")
                            queueResource.lookupQAgents(client.client, client.clientChannel, client.nameQ, client.strategy).then(function (data) {
                                //TODO: splice client from list
                            });
                        else
                            console.log("client null");

                        break;
                    }
                }
            });

        } else if (module !== null && module.module.action == "logout") {
            queueResource.updateAgentStatus(internalCaller, module, client, incoming).then(function (data) {
                console.log(data);
            });
        } else if (module !== null && module.module.action == "hold") {
            var url = config['app_host'] + ':' + config['app_port'] + '/callLog/getCallLogByNumber/' + internalCaller;
            request(url, function (error, response, callLogs) {
                if (typeof callLogs == 'string')
                    var cdrs = JSON.parse(callLogs);
                console.log("============================================>CallLogs",cdrs);
                cdrs.forEach(function (cdr) {
                    setTimeout(function () {
                        if(!(cdr.ended)) {
                            if(cdr.from_uri == internalCaller) {
                                client.channels.hold(
                                    {channelId: cdr.to_id},
                                    function (err) {
                                        if(err)
                                            console.log("=================>Error hold channel to",cdr.to_id);
                                        console.log("========================> channel To Hold",cdr.to_id);
                                    }
                                );
                            } else if(cdr.to_uri == internalCaller) {
                                client.channels.hold(
                                    {channelId: cdr.from_id},
                                    function (err) {
                                        if(err)
                                            console.log("=================>Error hold channel from",cdr.from_id);
                                        console.log("========================> channel From Hold",cdr.from_id);
                                    }
                                );
                            }
                        }
                    }, 0);

                });
            });
        } else if (module !== null && module.module.action == "unhold") {
            var url = config['app_host'] + ':' + config['app_port'] + '/callLog/getCallLogByNumber/' + internalCaller;
            request(url, function (error, response, callLogs) {
                if (typeof callLogs == 'string')
                    var cdrs = JSON.parse(callLogs);
                console.log("============================================>CallLogs",cdrs);
                cdrs.forEach(function (cdr) {
                    setTimeout(function () {
                        if(!(cdr.ended)) {
                            if(cdr.from_uri == internalCaller) {
                                client.channels.unhold(
                                    {channelId: cdr.to_id},
                                    function (err) {
                                        if(err)
                                            console.log("=================>Error UnHold channel to",cdr.to_id);
                                        console.log("========================> channel To UnHold",cdr.to_id);
                                    }
                                );
                            } else if(cdr.to_uri == internalCaller) {
                                client.channels.unhold(
                                    {channelId: cdr.from_id},
                                    function (err) {
                                        if(err)
                                            console.log("=================>Error UnHold channel from",cdr.from_id);
                                        console.log("========================> channel From UnHold",cdr.from_id);
                                    }
                                );
                            }
                        }
                    }, 0);

                });
            });
        }
    } else {
        queueResource.handleClientAdd(client, nameQ, incoming, type, strategy, welcome, moh).then(function (clientAdded) {
            queueResource.lookupQAgents(client, incoming, nameQ, strategy).then(function (data) {});
        });
    }
};
module.exports = queueResource;
