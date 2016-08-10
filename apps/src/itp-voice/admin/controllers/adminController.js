/**
 * Created by Lucas on 10/12/15.
 */
var Q = require('q');
var rr = require('rr');
var uuid = require('uuid');
var events = require('events');
var Devices = require('../../submodules/controllers/deviceController');
var Ivrs = require('../../submodules/controllers/ivrController');
var Queues = require('../../submodules/controllers/queueController');
var Numbers = require('../../submodules/controllers/numberController');
var FeatureCode = require('../../submodules/controllers/featureCodeController');
var Menu = require('../../submodules/controllers/menuController');
var AgentQ = require('../../submodules/controllers/agentQueueController');
var Users = require('./../../../users/controllers/userController');
var MailBox = require('../../submodules/controllers/mailBoxController');
var Messages = require('../../submodules/controllers/messageController');
var ActiveCalls = require('../../submodules/controllers/activeCallController');

var devices = Devices;
var ivrs = Ivrs;
var queuesCtrl = new Queues();
var numbers = new Numbers();
var featureCodes = new FeatureCode();
var menu = new Menu();
var agentQ = new AgentQ();
var users = new Users();
var mailBox = new MailBox();
var messages = new Messages();
var activeCalls = new ActiveCalls();
var adminController = new events.EventEmitter();

var queues = {};

adminController.addActiveCall = function (body) {
    var deferred = Q.defer();
    console.log("Body ", body);
    var resultResource = adminController.getResourceByNumber(body.from_uri, "");
    console.log("Result :", resultResource);
    resultResource.then(function (resource) {
        body.account = resource.data.account;
        activeCalls.addActiveCall(body)
            .then(function (activeCall) {
                deferred.resolve(activeCall);
            }, function (error) {
                deferred.resolve({});
            });
    }, function (error) {
        var resultResource = adminController.getResourceByNumber(body.to_uri, "");
        resultResource.then(function (resource) {
            body.account = resource.data.account;
            activeCalls.addActiveCall(body)
                .then(function (activeCall) {
                    deferred.resolve(activeCall);
                }, function (error) {
                    deferred.resolve({});
                })
        }, function (error) {
            deferred.resolve({});
        });
    });
    return deferred.promise;
};
adminController.provisionDevice = function (device) {
    var deferred = Q.defer();
    numbers.checkIfExists(device.sip_settings.internal, device.account)
        .then(function(ifExists) {
            if(ifExists){
                deferred.reject({error: "Internal already exists chose an other number"});
            }else{
                devices.addDevice(device)
                    .then(function(createdDevice) {
                        var newNumber = {
                            number: createdDevice.sip_settings.internal,
                            account: createdDevice.account,
                            use_caller_id: false
                        };
                        numbers.addExtention(newNumber)
                            .then(function (createdNumber) {
                                var newIvr = {
                                    module: createdDevice._id,
                                    numbers: createdNumber._id,
                                    account: createdDevice.account,
                                    type: "device"
                                };
                                ivrs.addIvr(newIvr)
                                    .then(function (createdIvr) {
                                        deferred.resolve({device: createdDevice, ivr: createdIvr});
                                    }, function (err) {
                                        deferred.reject(err);
                                    })
                            }, function (err) {
                                deferred.reject(err);
                            })
                    },function(err){
                        deferred.reject(err);
                    });
            }
        });
    return deferred.promise;
};
adminController.noAnswerAction = function (extension, channelId) {
    var deferred = Q.defer();
    var device = {
        username: extension
    };
    var resultDevice = devices.getDevice(device);
    resultDevice.then(function (device) {
        console.log(device);
        if (device.length === 0 || !device) {
            var response =
            {
                action: "hangup",
                channel: channelId,
                extension: extension
            };
            deferred.reject(response);
        }
        else {
            device = device[0];
            var userId = device.user;
            var accountId = device.account;
            var resultUser = users.getUserById(userId, accountId);
            resultUser.then(function (user) {
                if (!user) {
                    var response =
                    {
                        action: "hangup",
                        channel: channelId,
                        extension: extension
                    };
                    deferred.reject(response);
                }
                else {
                    var resultMailBox = mailBox.getMailBoxByUser(userId, accountId);
                    resultMailBox.then(function (mailBox) {
                        console.log(mailBox);
                        var response =
                        {
                            action: "record",
                            channel: channelId,
                            mailBox: mailBox,
                            extension: extension
                        };
                        deferred.resolve(response);
                    }, function (error) {
                        var response =
                        {
                            action: "hangup",
                            channel: channelId,
                            extension: extension
                        };
                        deferred.reject(response);
                    });
                }
            }, function (error) {
                var response =
                {
                    action: "hangup",
                    channel: channelId,
                    extension: extension
                };
                deferred.reject(response);
            });
        }
    }, function (error) {
        var response =
        {
            action: "hangup",
            channel: channelId,
            extension: extension
        };
        deferred.reject(response);
    });
    return deferred.promise;
};
/*need to be tested*/
adminController.getResourceByNumber = function (number, caller, account, step) {
    var deferred = Q.defer();
    numbers.getNumber(number, account).then(function (numberObject) {
        if (numberObject != null && numberObject != "{}") {
            var resultIvr = ivrs.getIvrByNumber(numberObject, account, step);
            resultIvr.then(function (ivr) {
                console.log("Result Ivr:", ivr);
                if (ivr != null && JSON.stringify(ivr) != "{}") {
                    if (ivr.type == 'ringGroup') {
                        var resourcesRG = [];
                        for (var i = 0; i < ivr.module.length; i++) {
                            console.log("Ivr Numbers : ", ivr.module);
                            if(ivr.module[i].type === "device"){
                                if(ivr.module[i].device.type === "sip_phone")
                                    var objRes = {
                                        sip_settings: ivr.module[i].device.sip_settings,
                                        device_type: ivr.module[i].device.type,
                                        type: "device"
                                    };
                                else if(ivr.module[i].device.type === "cell_phone")
                                    var objRes = {
                                        forward: ivr.module[i].device.forward,
                                        device_type: ivr.module[i].device.type,
                                        type: "device"
                                    };
                                resourcesRG.push(objRes);
                            }
                            else if(ivr.module[i].type === "number"){
                                var objRes = {
                                    number: ivr.module[i].number,
                                    type: "number"
                                };
                                resourcesRG.push(objRes);
                            }
                            if (i == ivr.module.length - 1) {
                                var data =
                                {
                                    resources: resourcesRG,
                                    type: "ringGroup",
                                    action: "originateResource",
                                    account: ivr.account,
                                    caller: caller,
                                    resource_from: "ivr"
                                };
                                deferred.resolve({data: data});
                            }
                        }
                    } else if (ivr.type == 'if') {
                        var data =
                        {
                            module: ivr.module,
                            type: "if",
                            action: "originateResource",
                            account: ivr.account,
                            caller: caller,
                            resource_from: "ivr"
                        };
                        deferred.resolve({data: data});
                    }  else if (ivr.type == 'get') {
                        var data =
                        {
                            module: ivr.module,
                            type: "get",
                            action: "originateResource",
                            account: ivr.account,
                            caller: caller,
                            resource_from: "ivr"
                        };
                        deferred.resolve({data: data});
                    } else if (ivr.type == 'device') {
                        var data =
                        {
                            sip_settings: ivr.module.sip_settings,
                            type: "device",
                            action: "originateResource",
                            account: ivr.account,
                            caller: caller,
                            resource_from: "ivr"
                        };
                        console.log("Device: ", data);
                        deferred.resolve({data: data});
                    }  else if (ivr.type == 'voiceMail') {
                        console.log("VoiceMail: ", ivr);
                        var data =
                        {
                            mailBox: ivr.module,
                            type: "voiceMail",
                            action: "originateResource",
                            account: ivr.account,
                            caller: caller,
                            resource_from: "ivr"
                        };
                        console.log("Device: ", data);
                        deferred.resolve({data: data});
                    } else if (ivr.type == 'menu') {
                        var data =
                        {
                            module: ivr.module,
                            type: "menu",
                            action: "menuResource",
                            account: ivr.account,
                            caller: caller,
                            resource_from: "ivr"
                        };
                        deferred.resolve({data: data});
                    } else if (ivr.type == 'queue') {
                        console.log("Senario: ", ivr);
                        var nameQ = ivr.module.name;
                        console.log("nameQ: ", nameQ);
                        var accountID = ivr.account;
                        if (!(accountID in queues))
                            queues[accountID] = [];
                        if (!(nameQ in queues[accountID]))
                            queues[accountID][nameQ] = {};
                        if (!("clients" in queues[accountID][nameQ]))
                            queues[accountID][nameQ]["clients"] = [];
                        if (!("agents" in queues[accountID][nameQ]))
                            queues[accountID][nameQ]["agents"] = [];
                        console.log("Ivr: ", ivr);
                        var resultQ = adminController.getAgentsByQId(ivr.idQ, accountID);
                        resultQ.then(function (agentsQ) {
                            console.log("AgentQ: ", JSON.stringify(agentsQ));
                            if (Object.keys(agentsQ).length !== 0) {
                                if (ivr.module.strategy == 'ringall') {
                                    var agents = agentsQ.agentsNumbers;
                                } else if (ivr.module.strategy == 'roundrobin') {
                                    var agent = rr(agentsQ.agentsNumbers);
                                    console.log("Agent: ", agent);
                                    var agents = agentsQ.agentsNumbers == null ? null : agent;
                                }
                                var data =
                                {
                                    freeAgents: true,
                                    agents: agentsQ.agentsNumbers,
                                    type: "queue",
                                    action: "queueResource",
                                    idQ: ivr.idQ,
                                    strategy: ivr.module.strategy,
                                    welcome: ivr.module.welcome_message,
                                    moh: ivr.module.moh,
                                    name: ivr.module.name,
                                    caller: caller,
                                    account: accountID,
                                    resource_from: "ivr"
                                };
                                deferred.resolve({data: data});
                            } else {
                                console.log("AgentsQ is ", agentsQ);
                                var data =
                                {
                                    freeAgents: false,
                                    agents: [],
                                    type: "queue",
                                    action: "queueResource",
                                    idQ: ivr.idQ,
                                    strategy: ivr.module.strategy,
                                    welcome: ivr.module.welcome_message,
                                    moh: ivr.module.moh,
                                    name: ivr.module.name,
                                    caller: caller,
                                    account: accountID,
                                    resource_from: "ivr"
                                };
                                deferred.resolve({data: data, error: "agentsQ is undefined or null"});
                            }

                        }, function (error) {

                        });
                    }
                }
            }, function (error) {
                console.log(error);
                deferred.reject(error);
            });
        }
    }, function (error) {
        console.log("Get number error: ", error, " for extension", number);
        var numberObj = {username: number};
        var result = devices.getDevice(numberObj);
        result.then(function (device) {
            console.log("device", device);
            var resultInternalBySip = devices.getInternalBySip(caller);
            resultInternalBySip.then(function (caller) {
                console.log("resultInternalBySip:" ,caller);
                if (device != null && Object.keys(device).length !== 0) {
                    console.log("I was able to get a device: ", device);
                    var data =
                    {
                        sip_settings: device[0].sip_settings,
                        type: "device",
                        action: "originateResource",
                        account: device[0].account,
                        caller: caller,
                        resource_from: "internal"
                    };
                    console.log('Data :', JSON.stringify(data));
                    deferred.resolve({data: data});
                } else {
                    console.log("I was not able to get a device");
                    var data = {};
                    deferred.resolve({data: data});
                }
            }, function (error) {
                console.log("get caller error ", error);
            });
        }, function (error) {
            console.log("Get device error: ", error, " for extension", number);
            var data = {
                username: caller
            };
            var result = devices.getDevice(data);
            result.then(function (device) {
                var json = {
                    account: device[0].account,
                    code: number
                };
                var resultFeatureCode = featureCodes.getFeatureCode(json);
                resultFeatureCode.then(function (featureCode) {
                    console.log("inside resultFeature Code", featureCode);
                    if (featureCode != null && JSON.stringify(featureCode) != "{}") {
                        console.log("I was able to get a feature Code: ", featureCode);
                        var data =
                        {
                            action: "featureCode",
                            account: device[0].account,
                            module: featureCode,
                            resource_from: "featureCode"
                        };
                        deferred.resolve({data: data});
                    } else {
                        console.log("featureCode RESOLVE", featureCode);
                        deferred.reject({data: "error retrieving featureCode"});
                    }
                }, function (error) {
                    console.log("Get featureCode error: ", error, " for extension", number);
                    var resultMailBox = mailBox.getMailBoxByNumber(number); // TODO: why we are fetching messages ?
                    resultMailBox.then(function (mailbox) {
                        var resultMessages = messages.getMessagesOfMailbox(mailbox._id);
                        resultMessages.then(function (messages) {
                            console.log("I was able to get a mailbox: ", mailbox);
                            var data =
                            {
                                type: "voicemail",
                                action: "voicemailResource",
                                account: device[0].account,
                                number: number,
                                resource_from: "voiceMail"
                            };
                            deferred.resolve({data: data});
                        }, function (error) {
                            console.log("Error get messages of mailbox :::getResourceByNumber", error);
                        });
                    }, function (error) {
                        console.log("Get Mailbox error: ", error, " for extension", number);
                        var data =
                        {
                            type: "offNet",
                            action: "originateResource",
                            account: device[0].account,
                            number: number,
                            resource_from: "offNet"
                        };
                        console.log("offNet: ", data);
                        deferred.resolve({data: data});
                    });
                });
            }, function (err) {
                console.log("Err Get account");
            });
        });
    });
    return deferred.promise;
};


adminController.getMenuOptionByDigit = function (digit, options) {
    var deferred = Q.defer();
    for (var i = 0; i < options.length; i++) {
        if (options[i].digit == digit) {
            var type = options[i].type;
            if (type == 'device') {
                var data =
                {
                    sip_settings: options[i].module.sip_settings,
                    type: "device",
                    action: "originateResource"
                };
                deferred.resolve({data: data});
            } else if (type == 'ringGroup') {
                var devicesRG = [];
                for (var j = 0; j < options[i].module.length; j++) {
                    devicesRG.push({sip_settings: options[i].module[j].sip_settings});
                    if (j == options[i].module.length - 1) {
                        var data =
                        {
                            devices: devicesRG,
                            type: "ringGroup",
                            action: "originateResource"
                        };
                        deferred.resolve({data: data});
                    }
                }
            }
        }
    }
    return deferred.promise;
};
adminController.getAgentsByQId = function (idQ, account) {
    console.log("Account: ", account);
    var eventID = uuid.v4();
    var deferred = Q.defer();
    var agentsNumbers = [];
    var devicesArr = [];
    var resultAQ = agentQ.getAQByQueueId(idQ);
    resultAQ.then(function (agentQs) {
        if (typeof agentQs == 'string')
            agentQs = JSON.parse(agentQs);
        var agents = [];
        for (var i = 0; i < agentQs.length; i++) {
            if (agentQs[i].status === "login") {
                agents.push(agentQs[i].agentId);
            }
        }
        var count = agents.length;
        console.log("Agents getAgentsByQId: ", agents);
        adminController.on("adminController:NumberFound-"+eventID, function () {
            count--;
            console.log("Count: ", count, count === 0);
            if (count === 0){
                if(agents.length === 0)
                    deferred.resolve({});
                else
                    deferred.resolve({agentsNumbers: agentsNumbers});
            }
        });
        for(var j=0; j<agents.length; j++){
            console.log("Agent getAgentsByQId: ", agents[j]);
            var resultUser = users.getUserById(agents[j], account);
            resultUser.then(function (user) {
                var numbers = [];
                console.log("DevicesArr: ", user.devices);
                devices.getBulkDevice(user.devices, account)
                    .then(function (devices) {
                        for (var i=0; i<devices.length; i++)
                            numbers.push(
                                {
                                    sip_settings: {
                                        internal: devices[i].sip_settings
                                    }
                                }
                            );
                        agentsNumbers.push({
                            agentId: agents[j],
                            numbers: numbers
                        });
                        adminController.emit("adminController:NumberFound-"+eventID);
                    }, function (error) {
                        console.log("unable to get devices of agents: ", agents[j]);
                        adminController.emit("adminController:NumberFound-"+eventID);
                    });
            }, function (error) {
                console.log("unable to get user of agents: ", agents[j]);
                adminController.emit("adminController:NumberFound-"+eventID);
            });
        }
        if( agents.length === 0){
            adminController.emit("adminController:NumberFound-"+eventID);
        }
    }, function (error) {
        deferred.resolve(error);
    });
    return deferred.promise;
};
adminController.getNextAgent = function (agentId, idQ, account) {
    var deferred = Q.defer();
    var resultQ = adminController.getAgentsByQId(idQ, account);
    resultQ.then(function (agentsQ) {
        console.log("***********************NEXT AGENT", JSON.stringify(agentsQ));
        var agentsArr = agentsQ.agentsNumbers;
        console.log("*********************Agents ARR ::: BEFORE ::: ", JSON.stringify(agentsArr));
        for (var i = 0; i < agentsArr.length; i++) {
            if (agentsArr[i].agentId == agentId && agentsArr.length > 1)
                agentsArr.splice(i, 1);
            else
                console.log("only one agent in the list !");
        }
        console.log("*********************Agents ARR ::: AFTER ::: ", JSON.stringify(agentsArr));
        var agentRR = rr(agentsArr);
        var data =
        {
            agent: agentRR,
            type: "queue",
            strategy: "roundrobin",
            idQ: idQ,
            action: "queueResource"
        };

        deferred.resolve({data: data});
    }, function (error) {

    });
    return deferred.promise;
};
adminController.updateAgentStatus = function (agentNumber, status) {
    console.log("updateAgentStatus", status);
    var deferred = Q.defer();
    var resultSip = devices.getInternalBySip(agentNumber);
    resultSip.then(function (numAgent) {
        console.log("numAgent: ",numAgent);
        var resultDevice = devices.getDeviceByInternal(numAgent);
        resultDevice.then(function (device) {
            console.log("Device: ",device);
            if (typeof device == 'string')
                device = JSON.parse(device);
            var idDevice = JSON.stringify(device._id);
            idDevice = idDevice.replace(/^"(.*)"$/, '$1');
            var resultUser = users.getUserByDevice(idDevice);
            resultUser.then(function (user) {
                console.log("User: ",user);
                var idUser = user._id;
                var accountID = user.account;
                var resultAgentQ = agentQ.updateStatusAgent(idUser, status);
                resultAgentQ.then(function (agentQ) {
                    console.log("updateStatusAgent: ",agentQ);
                    console.log("agent Queue updated: ", agentQ);
                    if (status == "login") {
                        var resultQs = adminController.getAllQsOfAgent(idUser);
                        resultQs.then(function (names) {
                            for (var i=0; i<names.length; i++) {
                                var nameQ = names[i];
                                console.log("nameQ: ", names[i]);
                                if (!(accountID in queues))
                                    queues[accountID] = [];
                                if (!(nameQ in queues[accountID]))
                                    queues[accountID][nameQ] = {};
                                if (!("clients" in queues[accountID][nameQ]))
                                    queues[accountID][nameQ]["clients"] = [];
                                if (!("agents" in queues[accountID][nameQ]))
                                    queues[accountID][nameQ]["agents"] = [];
                            }
                            console.log("Here From Login", queues);
                            deferred.resolve({qNames: names});
                        }, function (error) {
                            console.log("Error from getAllQsOfAgent :::AdminController:::", error);
                        });
                    }
                }, function (error) {
                    deferred.reject({error: "No agentQ found for idAgent :" + idUser});
                });
            }, function (error) {
                deferred.reject({error: "No User found for the device: " + device._id});
            });
        }, function (error) {
            deferred.reject({error: "No Device found for the agentNumber: " + numAgent});
        });
    }, function (error) {
        console.log("error get internal by sip");
        deferred.reject({error: "No Internal device found for the sip username: " + agentNumber});
    });

    return deferred.promise;
};

adminController.getAllQsOfAgent = function (id) {
    console.log("*****************getAllQsOfAgent:", id);
    var deferred = Q.defer();
    var agentId = JSON.stringify(id);
    agentId = agentId.replace(/^"(.*)"$/, '$1');
    var resultAQ = agentQ.getAQByAgentId(agentId);
    resultAQ.then(function (agentQs) {
        console.log("**************agentQs", agentQs.length);
        var qNames = [];
        if (agentQs !== null) {
            var count = agentQs.length;
            var eventID = uuid.v4();
            adminController.on("adminController:QueueFound-"+eventID, function () {
                count--;
                console.log("Count: ", count, count === 0);
                if (count === 0){
                    deferred.resolve(qNames);
                }
            });
            agentQs.forEach(function (agentQ, idx, arr) {
                var queueId = JSON.stringify(agentQ.queueId);
                queueId = queueId.replace(/^"(.*)"$/, '$1');
                console.log("QueueID: ", queueId);
                queuesCtrl.getQueueById(queueId).then(function (queue) {
                    qNames.push(queue.name);
                    adminController.emit("adminController:QueueFound-"+eventID);
                    console.log("qNames getAllQsOfAgent: ", qNames);
                }, function (err) {
                    adminController.emit("adminController:QueueFound-"+eventID);
                    console.log("error queue    ", err);
                });
            });
        }

    }, function (error) {
        console.log(error);
        res.send(error);
    });
    return deferred.promise;
};

adminController.lookupQAgents = function (qNames, account) {
    var deferred = Q.defer();
    var count = qNames.length;
    var eventID = uuid.v4();
    console.log("lookupQAgents", qNames, account);
    console.log("Queue: ", queues);
    adminController.on("adminController:agentQFound-"+eventID, function (data) {
        count--;
        console.log(data, count, data !== undefined, count === 0);
        if (data !== undefined) //TODO: dont worry it will not resolve for multiple found
            deferred.resolve(data);
        else if (count === 0)
            deferred.resolve({});
    });
    for (var k = 0; k < qNames.length; k++) {
        var qName = qNames[k];
        console.log("qName", qName, "clients" in queues[account][qName] && queues[account][qName].clients.length != 0);
        if ("clients" in queues[account][qName]) {
            console.log("nameQ ", qName, typeof qName);
            var clients = queues[account][qName].clients;
            console.log("clients ", clients, clients.length);
            if (clients.length) {
                var client = clients[0];
                var resultQByName = queuesCtrl.getQueueByName(qName, account);
                resultQByName.then(function (queue) {
                    if (typeof queue == 'string')
                        queue = JSON.parse(queue);
                    console.log("Queue : ", queue);
                    var idQ = queue._id;
                    var resultAgents = adminController.getAgentsByQId(idQ, account);
                    resultAgents.then(function (agents) {
                        var data = {agentsQ: agents, client: client};
                        adminController.emit("adminController:agentQFound-"+eventID, data);
                    });
                }, function (err) {
                    adminController.emit("adminController:agentQFound-"+eventID);
                });
            } else {
                console.log("adminController:agentQFound-"+eventID);
                adminController.emit("adminController:agentQFound-"+eventID);
            }
        } else {
            adminController.emit("adminController:agentQFound-"+eventID);
        }
    }
    return deferred.promise;
};
adminController.addClientToQ = function (clientId, number, nameQ, strategy, account) {
    var deferred = Q.defer();
    console.log("***********************adminController addClientToQ", clientId, number, nameQ, strategy, account, JSON.stringify(queues));
    queues[account][nameQ].clients.push({
        clientChannel: clientId,
        number: number,
        nameQ: nameQ,
        strategy: strategy
    });
    console.log("Queue: ", {queues: queues});
    var result = {clients: queues[account][nameQ]['clients']};
    deferred.resolve(result);
    return deferred.promise;
};
adminController.removeClientFromQ = function (clientChannel, nameQ, account) {
    var deferred = Q.defer();
    if (queues[account][nameQ] != null && queues[account][nameQ].clients != null) {
        var i = 0;
        for ( i; i < queues[account][nameQ].clients.length; i++) {
            if (clientChannel === queues[account][nameQ].clients[i].clientChannel) {
                queues[account][nameQ].clients.splice(i, 1);
                console.log("::::::::::::::::::::::::::::::::::::::::client removed", queues[account][nameQ].clients);
                deferred.resolve({message: "client removed"});
            }
        }

        if (i === queues[account][nameQ].clients.length && clientChannel !== queues[account][nameQ].clients[i - 1].clientChannel) {
            console.log("::::::::::::::::::::::::::::::::::::::::client not found in any queue");
            deferred.resolve({message: "client not found in any queue"});
        }

    } else {
        deferred.resolve({message: "queues Or clients Null"});
        console.log("queues Or clients Null", queues[nameQ].clients);
    }
    deferred.reject({error: "queue indefined"});
    return deferred.promise;
};
/*need to be tested */
adminController.updateClientQ = function (clientId, number, nameQ, account) {
    var deferred = Q.defer();
    console.log("Update Client Q: ", clientId, number, nameQ, account);
    if (queues[account][nameQ] != null && queues[account][nameQ].clients != null) {
        var i = 0;
        for ( i; i < queues[account][nameQ].clients.length; i++) {
            if (number === queues[account][nameQ].clients[i].number) {
                queues[account][nameQ].clients[i].clientChannel = clientId;
                console.log("::::::::::::::::::::::::::::::::::::::::client updated", queues[account][nameQ].clients);
                deferred.resolve({message: "client updated"});
            }
        }
    }
    else {
        deferred.resolve({message: "queues Or clients Null"});
        console.log("queues Or clients Null", queues[nameQ].clients);
    }
    return deferred.promise;
};
adminController.getAccountIdByUsername = function (username) {
    var deferred = Q.defer();
    console.log("::::::::::::::::::::::::::::::::getAccountByUsername", username);
    var query = {username : username};
    var resultDevice = device.getDevice(query);
    resultDevice.then( function (device) {
        console.log("Account: ", device.account);
        deferred.resolve(device.account);
    }, function (error) {
        deferred.reject({Error: err});
    });
    return deferred.promise;
};

module.exports = adminController;