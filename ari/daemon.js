/**
 * Created by teliteck on 04/08/2015.
 */
var Q = require('q');
var config = require("./config/config");
var request = require('request');
var ari = require('ari-client');
var uuid = require('uuid');
var Api = require("./api");
var events = require('events');
var resources = {
    'originationResource': require('./origination/originationResource'),
    'getResource': require('./get/getResource'),
    'ifResource': require('./if/ifResource'),
    'voiceMailResource': require('./voiceMail/voiceMailResource'),
    'playbackResource': require('./playbackResource'),
    'originateResource': require('./originateResource'),
    'menuResource': require('./menu/menuResource'),
    'featureResource': require('./featureResource'),
    'queueResource': require('./queueResource')
};
var SoundsController = require('./soundsController');
var soundsController = new SoundsController();
var VoiceMailResource = require('./toRemoveAfterTest/voiceMailResource');
var voiceMailResource = new VoiceMailResource();
var api = new Api();
var daemon = new events.EventEmitter();

var tabExtensions = ['i', 't', 'T', 's', 'o', '', ' ', '#', '90001112063171541'];
ari.connect('http://192.112.255.83:4526', 'user_1253mpiu', 'p@ssw0rd71$', clientLoaded);

daemon.fireListeners = function(client, daemonID) {
    daemon.on("listener:newCall-"+daemonID, function (params) {
        var step = params[0];
        var event = params[1];
        var channel = params[2];
        var realm = event.args[0].replace(">)", "").replace(";transport=UDP", "").split("@")[1];
        var extension = event.channel['dialplan']['exten'];
        var agentNum = event.channel.caller.number;
        var playback = client.Playback();

        if (tabExtensions.indexOf(extension) <= -1) {
            var json = {
                caller: agentNum,
                step: step
            };
            console.log("Resource request: ", json, extension);
            api.getResource(json, extension, realm)
                .then( function(resource) {
                    console.log("Resource: ", resource);

                    if("data" in resource) {
                        var account = resource.data.account;
                        var caller = resource.data.caller;
                        switch (resource.data.action) {
                            case "originateResource":
                                channel.play({media: 'tone:ring;tonezone=us'}, playback, function (err, result) {});
                                switch (resource.data.type) {
                                    case "voiceMail":
                                        var voiceMail = resource.data.mailBox;
                                        resources['voiceMailResource'].processVoiceMail(client, channel, voiceMail, daemonID);
                                        break;
                                    case "get":
                                        var variable = resource.data.module;
                                        resources['getResource'].processGet(client, channel, variable, daemonID);
                                        break;
                                    case "if":
                                        var ifModule = resource.data.module;
                                        resources['ifResource'].processIf(client, channel, ifModule, caller, account, daemonID);
                                        break;
                                    case "device":
                                        var device = resource.data.sip_settings;
                                        resources['originationResource'].processDevice(client, channel, device, caller, account, daemonID);
                                        break;
                                    case "ringGroup":
                                        var ringGroup = resource.data.resources;
                                        resources['originationResource'].processGroup(client, channel, ringGroup, caller, account, daemonID);
                                        break;
                                    case "offNet":
                                        var number = resource.data.number;
                                        resources['originationResource'].processOffNet(client, channel, number, caller, account, daemonID);
                                        break;
                                    default:
                                        console.log("Nothing to do here !!!!", resource.data.type);
                                        break;
                                }
                                break;
                            case "menuResource":
                                var module = resource.data.module;
                                resources['menuResource'].processMenu(client, event, channel, module, caller, account, daemonID, playback);
                                break;
                            case 'queueResource':
                                var welcome = resource.data.welcome,
                                    moh = resource.data.moh;
                                soundsController.createBook(welcome)
                                    .then(function (file) {
                                        var playWelcome = client.Playback();
                                        channel.play({media: 'sound:' + '/var/lib/asterisk/sounds/en/itp/' + file.name},
                                            playWelcome, function (err, playWelcome) {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        playWelcome.once('PlaybackFinished', function (event, instance) {
                                            var playMoh = client.Playback();
                                            // TODO: I need to play MoH while establishing
                                            var agents = resource.data.agents;
                                            var qName = resource.data.name;
                                            var strategy = resource.data.strategy;
                                            resources['queueResource'].needCallback(client, channel, agents, strategy)
                                                .then(function (res) {
                                                    switch (res) {
                                                        case 'ringall':
                                                            daemon.ringallFunction(channel, resource, account, qName, caller);
                                                            break;
                                                        case'roundrobin':
                                                            daemon.roundrobinFunction(channel, resource, account);
                                                            break;
                                                        case 'callback':
                                                            daemon.callbackFunction(channel, resource, account);
                                                            break;
                                                        case 'hold':
                                                            daemon.holdFunction(channel, resource, account);
                                                            break;
                                                        default:
                                                            console.log(res);
                                                            break;
                                                    }
                                                }, function (error) {
                                                    console.log("queueResource error:", error);
                                                });
                                        });
                                    }, function (error) {
                                        console.log("soundsController error:", error);
                                    });
                                break;
                            case "featureCode":
                                if (resource.data.module != null) {
                                    if (resource.data.module.action == "login") {
                                        var jsonLogin = {
                                            status: "login",
                                            agentNumber: agentNum
                                        };
                                        daemon.updateAndLookup(jsonLogin, channel, resource, account, true);
                                    } else if (resource.data.module.action == "logout") {
                                        var jsonLogout = {
                                            status: "logout",
                                            agentNumber: agentNum
                                        };
                                        api.updateAgentStatus(jsonLogout, account);
                                        resources['featureResource'].agentLoggedOut(client, channel);
                                    }
                                }
                        }
                        ///nextStep listener
                        resources['originationResource'].removeAllListeners('originationResource:nextStep-' + daemonID);
                        resources['originationResource'].on('originationResource:nextStep-' + daemonID, function () {
                            if (step.position === "children") {
                                step.order += 1;
                                step.position = "parent";
                            }else
                                step.position = "children";
                            if(resource.data.resource_from === "ivr")
                                daemon.emit('listener:newCall-' + daemonID, [step, event, channel]);
                        });
                        ///PlayBack lisener
                        resources['originationResource'].removeAllListeners('originationResource:stopPlayback-' + daemonID);
                        resources['originationResource'].on("originationResource:stopPlayback-" + daemonID, function () {
                            playback.stop()
                                .catch(function (error) {
                                    console.log("apparently playback for " + channel.id + " is dead");
                                });
                        });
                        ///Ring Group lisener
                        resources['originateResource'].removeAllListeners("originateResource:rgClientLeave");
                        resources['originateResource'].on('originateResource:rgClientLeave', function (data) {
                            var agentNumber = data.agent.sip_settings.sip.username;
                            var jsonStatus = {
                                status: "login",
                                agentNumber: agentNumber
                            };
                            daemon.updateAndLookup(jsonStatus, channel, resource, account, false);
                        });
                        resources['originateResource'].removeAllListeners("originateResource:rgAgentStatusUpdate");
                        resources['originateResource'].on("originateResource:rgAgentStatusUpdate", function (data) {
                            var agentNumber = data.agent.sip_settings.sip.username;
                            var jsonStatus = {
                                status: "incall",
                                agentNumber: agentNumber
                            };
                            api.updateAgentStatus(jsonStatus, account);
                            var jsonQClient =
                            {
                                clientId: data.client,
                                number: data.removeNumber,
                                account: resource.data.account,
                                nameQ: data.qname
                            };
                            api.removeClientFromQ(jsonQClient, account);
                        });
                        ///Hold unhold lisener
                        resources['originateResource'].removeAllListeners("originateResource:fcHoldUnHold");
                        resources['originateResource'].on("originateResource:fcHoldUnHold", function (data) {
                            resources['featureResource'].hande1FeatureCode(data, client, account);
                        });
                    }else{
                        if(step.position === "parent"){
                            console.log("Do hangup");
                            step.order = 0;
                            channel.hangup()
                                .catch(function () {
                                    console.log("apparently incoming is dead");
                                });
                        }else{
                            step.order += 1;
                            step.position = "parent";
                            daemon.emit('listener:newCall-' + daemonID, [step, event, channel]);
                        }
                    }
                }, function(err) {
                    console.log("Do hangup: ", err);
                    step.order = 0;
                    step.position = "parent";
                    channel.hangup()
                        .catch(function () {
                            console.log("apparently incoming is dead");
                        });
                });
        } else {
            return;
        }
    });
};
function clientLoaded(err, client) {
    if (err) {
        throw err;
    }
    var daemonID = uuid.v4();
    client.on('StasisStart', stasisStart);
    client.start('voicelinx.itpscorp');
    daemon.fireListeners(client, daemonID);

    function stasisStart(event, channel) {
        step = {
            order : 0,
            position: "parent"
        };
        var params = [step, event, channel];
        daemon.emit("listener:newCall-"+daemonID, params);
    }

    function stasisEnd(event, channel) {
        channel.hangup(function (err) {
            console.log("hang up error from stasisEnd daemon: ", err);
        });
        console.log("hanging up from daemon");
    }
}


//Queue functions
daemon.ringallFunction = function(channel, resource, account, qName, caller){
    console.log("Agents ringallFunction: ", resource.data.agents, account);
    resources['originateResource'].executeRG(client, channel, resource.data.agents, qName, caller, account);
    // resources['originateResource'].removeAllListeners("originateResource:rgNoAnswerAll");
    resources['originateResource'].on('originateResource:rgNoAnswerAll', function (data) {
        console.log("rgNoAnswerAll event: ", data);
        if (data !== null && data.channelState == "rgNoAnswer") {
            var jsonQClients =
            {
                nameQ: resource.data.name,
                strategy: resource.data.strategy,
                account: account,
                clientId: channel.id
            };
            api.addClientToQ(jsonQClients, account);
        }
    });
};
daemon.roundrobinFunction = function(channel, resource, account){
    console.log("=========================================> resource Q", JSON.stringify(resource.data));
    if (resource.data.agents[0] !== null && resource.data.agents[0] !== undefined) {
        var agent =
        {
            sip_settings: {
                sip: resource.data.agents[0].numbers[0].sip_settings.internal.sip
            },
            agentId: resource.data.agents[0].agentId
        };
        console.log("Agent: ", agent);
        resources['originateResource'].originateLoop(client, channel, agent, account);
        resources['originateResource'].removeAllListeners("originateResource:rrNoAnswer");
        resources['originateResource'].on("originateResource:rrNoAnswer", function (data) {
            console.log("==============================================> NoANSWER", JSON.stringify(data));
            var jsonAgent =
            {
                idQ: resource.data.idQ,
                account: account,
                agentId: data.agent.agentId
            };
            var url = config['app_host'] + ':' + config['app_port'] + '/accounts/'+ account + '/api/getNextAgent';
            console.log(url, "\n", jsonAgent);
            request({
                "rejectUnauthorized": false,
                "url": url,
                "method": "POST",
                headers: {
                    "content-type": "application/json"
                },
                json: jsonAgent
            }, function (err, response, agentRR) {
                console.log("========================================> agentRR", JSON.stringify(agentRR));
                var nextAgent =
                {
                    sip_settings: {
                        sip: agentRR.data.agent.numbers[0].sip_settings.internal.sip
                    },
                    agentId: agentRR.data.agent.agentId
                };
                console.log("Next Agent to call: ", nextAgent);
                resources['originateResource'].originateLoop(client, channel, nextAgent, account);

            });
        });
        resources['originateResource'].once("originateResource:rrAgentStatusUpdate", function (data) {
            console.log("=========================EVENT : ", JSON.stringify(data));
            var agentNumber = data.agent.sip_settings.sip.username;
            var jsonStatus = {
                status: "incall",
                agentNumber: agentNumber
            };
            api.updateAgentStatus(jsonStatus, account);
        });
        resources['originateResource'].removeAllListeners("originateResource:rrClientHangUp");
        resources['originateResource'].on('originateResource:rrClientHangUp', function (data) {
            console.log("=========================================client hang up=================================: ", JSON.stringify(data));
            var agentNumber = data.agent.sip_settings.sip.username;
            var jsonStatus = {
                status: "login",
                agentNumber: agentNumber
            };
            api.updateAgentStatus(jsonStatus, account);
        });
    } else {
        console.log("I need a console here, I don't know what to do, I'm lost");
    }
};
daemon.callbackFunction = function(channel, resource, account){
    console.log("Callback");
    client.channels.get({channelId: channel.id},
        function (err, res) {
            if (err) {
                console.log("Error get channel: ",channel.id, err);
            } else {
                res.hangup();
            }
        }
    );
    var jsonQClients =
    {
        nameQ: resource.data.name,
        strategy: resource.data.strategy,
        account: account,
        clientId: null,
        number: resource.data.caller
    };
    api.addClientToQ(jsonQClients, account);
};
daemon.updateAndLookup = function(json, channel, resource, account, check){
    api.updateAgentStatus(json, account)
        .then(function (qNames) {
            var jsonQNames = {
                qNames: qNames,
                account: resource.data.account
            };
            api.lookupQAgents(jsonQNames, account)
                .then( function (agentsQ) {
                    console.log("AgentsQ: ", agentsQ);
                    if (typeof agentsQ == 'string')
                        agentsQ = JSON.parse(agentsQ);
                    if (Object.keys(agentsQ).length !== 0) {
                        if (agentsQ.client.clientChannel) {
                            if(check)
                                resources['featureResource'].agentLoggedIn(client, channel);
                            client.channels.get({channelId: agentsQ.client.clientChannel})
                                .then(function (clientChannel) {
                                    resources['originateResource'].executeRG(client, clientChannel, agentsQ.agentsQ.agentsNumbers, agentsQ.client.nameQ, resource.data.caller, account);
                                }).catch(function (err) {
                                    console.log("Error to get channel: ", err);
                                });
                        }else{
                            api.getResource(resource.data.caller, agentsQ.client.number, account)
                                .then( function (resource) {
                                    var type = resource.data.type;
                                    console.log("Resource: ", resource, type);
                                    switch(type){
                                        case 'device':
                                            var device = {
                                                sip_settings: {
                                                    internal: resource.data.sip_settings.internal,
                                                    sip: resource.data.sip_settings.sip
                                                }
                                            };
                                            console.log("Device: ", device);
                                            resources['originateResource'].originateRG(client, channel, device, 'device', resource.data.caller, account, true);
                                            break;
                                        case 'ringGroup':
                                            var ringGroup = resource.data.resources;
                                            resources['originateResource'].originateRG(client, channel, ringGroup, 'ringGroup', resource.data.caller, account, true);
                                            break;
                                        case 'offNet':
                                            var number = {number: resource.data.number};
                                            resources['originateResource'].originateRG(client, channel, number, 'offNet', resource.data.caller, account, true);
                                            break;
                                    }
                                }, function (err) {
                                    console.log("Error get Resource: ", err);
                                });
                        }
                    } else {
                        if(check)
                            resources['featureResource'].agentLoggedIn(client, channel);
                        console.log("lookupQAgents: ", agentsQ);
                    }
                });
        });
};
daemon.holdFunction = function(channel, resource, account){
    /** TODO: NO free agents in the queue */
    console.log("channel hold", channel.id);
    client.channels.hold(
        {channelId: channel.id},
        function (err) {
            if (err)
                console.log("Error Hold channel of client in daemon", channel.id);
            console.log("channel hold success", channel.id);
        }
    );
    var jsonQClients =
    {
        nameQ: resource.data.name,
        strategy: resource.data.strategy,
        account: account,
        clientId: channel.id
    };
    api.addClientToQ(jsonQClients, account);
};
module.exports = daemon;