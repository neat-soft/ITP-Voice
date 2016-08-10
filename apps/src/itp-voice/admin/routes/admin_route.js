/**
 * Created by root on 05/05/16.
 */
var express = require('express');
var Login = require('../../login/loginController');
var login = new Login();
var Admin = require('../controllers/adminController');
var admin = Admin;
var Queues = require('../../submodules/controllers/queueController');
var queues = new Queues();
var AgentQueues = require('../../submodules/controllers/agentQueueController');
var agentQueues = new AgentQueues();
var Users = require('../../../users/controllers/userController');
var users = new Users();
var Devices = require('../../submodules/controllers/deviceController');
var devices = Devices;
var Accounts = require('../../../accounts/controllers/accountController');
var accounts = new Accounts();
var ActiveCalls = require('../../submodules/controllers/activeCallController');
var activeCalls = new ActiveCalls();
//var BrandProvisioners = require('../../submodules/controllers/provisioner/brandProvisionerController');
//var brandProvisioners = new BrandProvisioners();
var router = express.Router();

router.post('/no-answer-action/:extension', function (req, res, next) {
    var extension = req.params.extension;
    var channelId = req.body.channelId;
    var result = admin.noAnswerAction(extension, channelId);
    result.then(function (action) {
        res.send(action);
    }, function (error) {
        res.send(error);
    });

});

router.post('/add-active-call', function (req, res, next) {
    var body = req.body;
    console.log("RouteAdd active call :", body);
    var result = admin.addActiveCall(body);
    result.then(function (action) {
        console.log(action);
        res.send(action);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/provision-device', function (req, res, next) {
    var body = req.body;
    if ("account" in body)
        var result = admin.provisionDevice(body);
    else
        res.send({error: "account ID is required"});
    result.then(function (action) {
        res.send(action);
    }, function (error) {
        res.send(error);
    });
});

/*need to be tested*/
router.post('/login', function (req, res, next) {
    var data = req.body;
    login.check(data)
        .then(function (token) {
            res.json(token);
        }, function (status) {
            res.sendStatus(status);
        });
});
router.post('/resource/:did/', function (req, res, next) {
    //var agentId = req.body.agentId;
    var number = req.params.did;
    var account = req.account;
    var caller = req.body.caller;
    var step = req.body.step;
    var result = admin.getResourceByNumber(number, caller, account, step);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/getMenuOptionByDigit', function (req, res, next) {
    var options = req.body.options;
    var digit = req.body.digit;
    var result = admin.getMenuOptionByDigit(digit, options);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/updateAgentStatus', function (req, res, next) {
    var agentNumber = req.body.agentNumber,
        status = req.body.status;
    var result = admin.updateAgentStatus(agentNumber, status);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
//
router.get('/getQueueByName/:nameQ', function (req, res, next) {
    var nameQ = req.params.nameQ;
    var result = queues.getQueueByName(nameQ);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

router.post('/addClientToQ', function (req, res, next) {
    console.log("*************addCLientToQ body", req.body);
    var nameQ = req.body.nameQ,
        clientId = req.body.clientId,
        number = req.body.number,
        strategy = req.body.strategy,
        account = req.body.account;
    var result = admin.addClientToQ(clientId, number, nameQ, strategy, account);
    result.then(function (response) {
        console.log("addClientToQ: ",response);
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/updateClientQ', function (req, res, next) {
    var clientId = req.body.clientId,
        number = req.body.number,
        nameQ = req.body.nameQ,
        account = req.body.account;
    console.log("Update Client: ", clientId, number, nameQ, account);
    var result = admin.updateClientQ(clientId, number, nameQ, account);
    result.then(function (response) {
        console.log("removeClientFromQ: ",response);
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/removeClientFromQ', function (req, res, next) {
    var clientId = req.body.clientId,
        nameQ = req.body.nameQ,
        account = req.body.account;
    console.log("Remove Client: ", clientId, nameQ, account);
    var result = admin.removeClientFromQ(clientId, nameQ, account);
    result.then(function (response) {
        console.log("removeClientFromQ: ",response);
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/lookupQAgents', function (req, res, next) {
    console.log("lookupQAgents", req.body);
    var qNames = req.body.qNames.qNames;
    var account = req.body.account;
    console.log("Parameters: ", qNames, account);
    var result = admin.lookupQAgents(qNames, account);
    result.then(function (response) {
        console.log("lookupQAgent");
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/getNextAgent', function (req, res, next) {
    var agentId = req.body.agentId;
    var idQ = req.body.idQ;
    var account = req.body.account;
    console.log("********************agentId", agentId, "\n IdQ", idQ, "\n account", account);
    var result = admin.getNextAgent(agentId, idQ, account);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/getAQByQueueId/:QId', function (req, res, next) {
    var QId = req.params.QId;
    var agentNums = [];
    var devicesArr = [];
    var result = agentQueues.getAQByQueueId(QId);
    result.then(function (agentQs) {
        if (typeof agentQs == 'string')
            agentQs = JSON.parse(agentQs);
        var agentsArr = [];
        var l = agentQs.length;
        for (var i = 0; i < l; i++) {
            if (agentQs[i].status === "login") {
                agentsArr.push(agentQs[i].agentId);
            }
        }
        agentsArr.forEach(function (agent, index, array) {
            setTimeout(function () {
                var resultUser = users.getUserById(agent);
                resultUser.then(function (user) {
                    var devicesArr = user.devices;
                    var internalArr = [];
                    devicesArr.forEach(function (deviceId, idx, arr) {
                        setTimeout(function () {
                            var resultDevice = devices.getDeviceById(deviceId);
                            resultDevice.then(function (device) {
                                if (device != null) {
                                    internalArr.push(
                                        {
                                            sip_settings: {
                                                internal: device.sip_settings.internal
                                            }
                                        }
                                    );
                                }
                                if (idx === arr.length - 1) {
                                    agentNums.push({
                                        agentId: agent,
                                        numbers: internalArr
                                    });
                                    // last iteration
                                    if (index === array.length - 1) {
                                        res.send(agentNums);
                                    }
                                }
                            }, function (error) {
                                console.log(error);
                            });

                        }, 0);
                    });
                }, function (error) {
                    console.log("error getUserById :", error);
                });
            }, 0);
        });
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getUserById/:id', function (req, res, next) {
    var id = req.params.id;
    var result = users.getUserById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getDeviceById/:id', function (req, res, next) {
    var deviceId = req.params.id;
    var result = devices.getDeviceById(deviceId);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getAllQueuesOfAgent/:id', function (req, res, next) {
    var agentId = req.params.id;
    var resultAQ = agentQueues.getAQByAgentId(agentId);
    resultAQ.then(function (agentQs) {
        var qNames = [];
        if (agentQs !== null) {
            agentQs.forEach(function (agentQ, idx, arr) {
                queues.getQueueById(agentQ.queueId).then(function (queue) {
                    qNames.push(queue.name);
                    if (idx === arr.length - 1) {
                        res.send(qNames);
                    }
                }, function (err) {
                    console.log("error queue    ", err);
                });
            });
        }

    }, function (error) {
        console.log(error);
        res.send(error);
    })
});
router.post('/accounts', function (req, res, next) {
    var account = req.body;
    accounts.addAccount(account)
        .then(function (account) {
            res.send(account);
        }, function (err) {
            console.log("error ", err);
            res.send(err);
        })
});
/*router.get('/prov/:brand/:family/:model/:mac', function (req, res, next) {
 var brand = req.params.brand,
 model = req.params.model,
 family = req.params.family,
 mac = req.params.mac;
 console.log(brand, model, family, mac);
 var resultDevice = devices.getDeviceDyMAC(mac);
 resultDevice.then( function(device) {
 if(brand.toLowerCase() === "yealink"){
 var resut = brandProvisioners.yealinkBrand(family, model, device);
 resut.then( function(responce) {
 res.send(responce);
 }, function(err) {
 res.send(err);
 });
 }else if(brand.toLowerCase() === "cisco"){
 var resut = brandProvisioners.ciscoBrand(family, model, device);
 resut.then( function(responce) {
 res.send(responce);
 }, function(err) {
 res.send(err);
 });
 }else if(brand.toLowerCase() === "polycom"){
 var resut = brandProvisioners.polycomBrand(family, model, device);
 resut.then( function(responce) {
 res.send(responce);
 }, function(err) {
 res.send(err);
 });

 }else {
 console.log("Brand not found");
 res.send({error: "brandnot found"});
 }
 }, function (error) {
 res.send(error);
 });

 });*/

module.exports = router;
