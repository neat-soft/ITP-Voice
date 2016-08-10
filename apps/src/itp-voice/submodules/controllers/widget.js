/**
 * Created by youssef on 28/07/16.
 */
var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var Devices = require('../../submodules/controllers/deviceController');
var IfController = require('../../submodules/controllers/ifController');
var Get = require('../../submodules/controllers/getController');
var RingGroups = require('../../submodules/controllers/ringGroupController');
var Menus = require('../../submodules/controllers/menuController');
var Numbers = require('../../submodules/controllers/numberController');
var Queues = require('../../submodules/controllers/queueController');
var VoiceMails = require('../../submodules/controllers/mailBoxController');
var devices = Devices;
var ifController = new IfController();
var gets = new Get();
var ringGroups = new RingGroups();
var menus = new Menus();
var numbers = new Numbers();
var queues = new Queues();
var voiceMails = new VoiceMails();
var widgetEmitter= new events.EventEmitter();

device = function(id, account){
    console.log("inside", id);
    var deferred = Q.defer();
    devices.getDeviceById(id, account)
        .then(function (device) {
            console.log("resultDevice: ", device);
            var json = {
                "module": device,
                "type": "device",
                "account": account
            };
            console.log("Device: ", json);
            deferred.resolve(json);
        }, function (error) {
            deferred.reject(error);
            console.log(error);
        });
    return deferred.promise;
};

voiceMail = function(id, account) {
    var deferred = Q.defer();
    voiceMails.getMailBoxById(id, account)
        .then( function(mailBox) {
            var json = {
                module: {
                    action: "record",
                    mailBox: mailBox
                },
                type: "voiceMail",
                account: account
            };
            deferred.resolve(json);
        }, function() {
            deferred.reject({error: "voiceMail not found"});
        });
    return deferred.promise;
};

ifFunction = function(id, account) {
    var deferred = Q.defer();
    ifController.getById(id, account)
        .then(function (result) {
            console.log("resultIfExpression: ", result);
            widget[result.execution_if_true.type](result.execution_if_true.id)
                .then(function(trueResult) {
                    trueResult = {
                        module: trueResult,
                        type: "device"
                    };
                    widget[result.execution_if_false.type](result.execution_if_false.id)
                        .then(function (falseReslut) {
                            falseReslut = {
                                module: falseReslut,
                                type: "device"
                            };
                            var module = {
                                name: result.name,
                                expression: result.expression,
                                execution_if_true: trueResult,
                                execution_if_false: falseReslut
                            };
                            var json = {
                                "module": module,
                                "type": "if",
                                "account": account
                            };
                            console.log("json : ", json);
                            deferred.resolve(json);
                        }, function () {
                            console.log("Element not found");
                        })
                }, function() {
                    console.log("Element not found");
                });
        }, function (error) {
            deferred.reject(error);
            console.log(error);
        });
    return deferred.promise;
};

getFunction = function(id, account) {
    var deferred = Q.defer();
    gets.getVariable(id, account)
        .then(function (variable) {
            console.log("resultGetVariable: ", variable);
            var json = {
                "module": variable,
                "type": "get",
                "account": account
            };
            console.log("json : ", json);
            deferred.resolve(json);
        }, function (error) {
            deferred.reject(error);
            console.log(error);
        });
    return deferred.promise;
};

ringGroup = function(id, account) {
    var deferred = Q.defer();
    var eventID = uuid.v4();
    var tabResources = [];
    console.log(id, account);
    ringGroups.getRingGroupById(id, account)
        .then(function (rgroupe) {
            console.log("RingGroup: ", rgroupe);
            var length = rgroupe.resources.length;
            console.log("widget:item-processed-" + eventID);
            widgetEmitter.on("widget:item-processed-" + eventID, function () {
                length--;
                console.log("length: ", length);
                if (length === 0) {
                    var json = {
                        "module": tabResources,
                        "type": "ringGroup",
                        "account": account
                    };
                    console.log("Json: ", json);
                    deferred.resolve(json);
                    console.log("Remove Listener");
                    widgetEmitter.removeListener("widget:item-processed-" + eventID);
                }
            });
            console.log("length: ", length);
            for (var i = 0; i < rgroupe.resources.length; i++) {
                console.log("Eleme,t: ", rgroupe.resources[i]);
                if (rgroupe.resources[i].type === "device") {
                    var idDevice = rgroupe.resources[i].id;
                    devices.getDeviceById(idDevice)
                        .then(function (device) {
                            var deviceObj = {
                                device: device,
                                type: "device"
                            };
                            tabResources.push(deviceObj);
                            widgetEmitter.emit("widget:item-processed-" + eventID);
                        }, function () {
                            console.log('ERROR: Device not found in ring group !');
                            widgetEmitter.emit("widget:item-processed-" + eventID);
                        });
                } else if (rgroupe.resources[i].type === "number") {
                    var numberObj = {
                        number: rgroupe.resources[i].number,
                        type: "number"
                    };
                    tabResources.push(numberObj);
                    widgetEmitter.emit("widget:item-processed-" + eventID);
                }
            }
        }, function () {
            deferred.resolve({error: "ring group not found"});
        });
    return deferred.promise;
};

menu = function(id, account) {
    var deferred = Q.defer();
    var tabMenu = [];
    var objectMenu = {};
    menus.getMenuById(id, account)
        .then(function (menu) {
            var idMenu = menu._id;
            var arr = menu.options;
            var l = arr.length;
            arr.forEach(function (elemMenu) {
                if (elemMenu.type === 'device') {
                    devices.getDeviceById(elemMenu.module)
                        .then(function (device) {
                            var digit = elemMenu.digit;
                            var type = elemMenu.type;
                            var sound = elemMenu.sound;
                            objectMenu =
                            {
                                "digit": digit,
                                "type": type,
                                "sound": sound,
                                "module": device
                            };
                            tabMenu.push(objectMenu);
                            if (tabMenu.length == l) {
                                var json = {
                                    "module": tabMenu,
                                    "type": "menu",
                                    "account": account
                                };
                                console.log("====================================>JSON MENU", json);
                                deferred.resolve(json);
                            }
                        }, function (error) {
                            deferred.reject(error);
                            console.log('ERROR: Device not found in Menu !');
                        });
                }
                if (elemMenu.type === 'ringGroup') {
                    ringGroups.getRingGroupById(elemMenu.module)
                        .then(function (rgroupe) {
                            console.log("Menu: ", elemMenu);
                            console.log("RingGroup: ", rgroupe);
                            var digit = elemMenu.digit;
                            var type = elemMenu.type;
                            var sound = elemMenu.sound;
                            var tabresources = [];
                            var k = rgroupe.resources.length;
                            for (var i = 0; i < k; i++) {
                                var typeRessource = rgroupe.resources[i].type;
                                if (typeRessource === "device") {
                                    var idDevice = rgroupe.resources[i].id;
                                    console.log(idDevice);
                                    devices.getDeviceById(idDevice)
                                        .then(function (device) {
                                            tabresources.push(device);
                                            console.log("tabresources :", tabresources);
                                            if (tabresources.length == k) {
                                                objectMenu =
                                                {
                                                    "digit": digit,
                                                    "type": type,
                                                    "sound": sound,
                                                    "module": tabresources

                                                };
                                                tabMenu.push(objectMenu);
                                                if (tabMenu.length == l) {
                                                    var json = {
                                                        "module": tabMenu,
                                                        "type": "menu",
                                                        "account": account,
                                                        "idMenu": idMenu
                                                    };
                                                    deferred.resolve(json);
                                                }
                                            }

                                        }, function () {
                                            console.log('ERROR: Device not found in ring group !');
                                        });
                                } else {
                                    tabresources.push(rgroupe.resources[i]);
                                    console.log("tabresources :", tabresources);
                                    if (tabresources.length == k) {
                                        objectMenu =
                                        {
                                            "digit": digit,
                                            "type": type,
                                            "sound": sound,
                                            "module": tabresources

                                        };
                                        tabMenu.push(objectMenu);
                                        if (tabMenu.length == l) {
                                            var json = {
                                                "module": tabMenu,
                                                "type": "menu",
                                                "account": account,
                                                "idMenu": idMenu
                                            };
                                            deferred.resolve(json);
                                        }
                                    }
                                }
                            }
                        }, function (error) {
                            deferred.reject(error);
                            console.log('ERROR: Device not found in Menu !');
                        });
                }
                else if (elemMenu.type === 'number') {
                    var digit = elemMenu.digit;
                    var type = elemMenu.type;
                    var sound = elemMenu.sound;
                    numbers.getNumberById(elemMenu.module)
                        .then(function (number) {
                            objectMenu =
                            {
                                "digit": digit,
                                "type": type,
                                "sound": sound,
                                "module": number

                            };
                            tabMenu.push(objectMenu);
                            if (tabMenu.length == l) {
                                var json = {
                                    "module": tabMenu,
                                    "type": "menu",
                                    "account": account,
                                    "idMenu": idMenu
                                };
                                deferred.resolve(json);
                            }

                        }, function (error) {
                            deferred.reject(error);
                            console.log('ERROR: Number not found in Menu!');
                        });
                }
            });
        }, function () {
            console.log("ERROR: Menu not found !");
        });
    return deferred.promise;
};
queue = function(id, account) {
    var deferred = Q.defer();
    queues.getQueueById(id, account)
    .then(function (queue) {
        console.log("Queue : ", queue);
        var objectQueue = {
            "name": queue.name,
            "maxQueueSize": queue.max_queue_size,
            "extension": queue.extension,
            "welcome_message": queue.welcome_message,
            "moh": queue.moh,
            "strategy": queue.strategy,
            "_id": queue._id
        };
        var json = {
            "module": objectQueue,
            "type": "queue",
            "account": account,
            "idQ": queue._id
        };
        deferred.resolve(json);
    }, function (error) {
        deferred.reject(error);
        console.log("ERROR: Queue not found !");
    });
    return deferred.promise;
};

var widget = {
    device: device,
    queue: queue,
    menu: menu,
    if: ifFunction,
    get: getFunction,
    ringGroup: ringGroup,
    voiceMail: voiceMail
};

module.exports = widget;