/**
 * Created by Lucas on 30/11/15.
 */
var Device = require('mongoose').model('Device');
var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require("randomstring");
var NumberController = require('./numberController');
var numberController = new NumberController();
var deviceController = new events.EventEmitter();


deviceController.addDevice = function (device) {
    var newDevice = new Device(device);
    var deferred = Q.defer();
    var username = "dev_" + randomstring.generate({
            length: 4,
            charset: 'alphanumeric'
        });
    newDevice.sip_settings.sip.username = username;
    var password = randomstring.generate({
        length: 8,
        charset: 'alphanumeric'
    });
    /* Temp removed to get registartion more easy
    newDevice.sip_settings.sip.password = password;
    */
    newDevice.sip_settings.sip.password = "12345678";
    newDevice.save(function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};
deviceController.getAllDevices = function (account) {
    var deferred = Q.defer();
    if (account !== undefined)
        var json = {account: account};
    else
        var json = {};
    Device.find(json, function (err, devices) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(devices);
        }
    });
    return deferred.promise;
};
deviceController.getDeviceById = function (id, account, check) {
    console.log("inside getDeviceById: ", id, account, check);
    var deferred = Q.defer();
    if (check) {
        Device.findById(id, function (err, device) {
            console.log("find result: ", device, account, account.toString());
            if (err) {
                deferred.reject(error);
            } else if (device.account.toString() !== account.toString()) {
                console.log("Account, device.account: ", account, device.account);
                deferred.reject({"status": "nok", "response": "you can't query deviceController device"});
            } else {
                deferred.resolve(device);
            }
        });
    } else {
        Device.findById(id, function (err, device) {
            if (err) {
                deferred.reject(err);
            } else {
                console.log("Result 66: ", device);
                deferred.resolve(device);
            }
        });
    }
    return deferred.promise;
};
deviceController.authorizeDevice = function (device) {
    // TODO: add realm
    var deferred = Q.defer();
    var device = {
        "sip_settings.sip.username": device.username
    };
    console.log("sip_settings.sip.username", device);
    Device.findOne(device, function (err, device) {
        if (err) {
            console.log("error found device", err, device);
            deferred.reject(err);
        } else {
            console.log("found device", device);
            deferred.resolve(device);
        }
    });
    return deferred.promise;
};
deviceController.deleteById = function (id, account) {
    var deferred = Q.defer();
    console.log("deleteById", account);
    if (account === undefined) {
        Device.findByIdAndRemove(id, function (err, device) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(device);
            }
        });
    } else {
        var query = {
            _id: id,
            account: account
        };
        console.log("query", query);
        Device.findOneAndRemove(query, function (err, device) {
            console.log(err, device);
            if (device !== null) {
                deferred.resolve(device);
            } else {
                deferred.resolve({error: "User not found"});
            }
        });
    }
    return deferred.promise;
};
deviceController.updateById = function (id, body) {
    var deferred = Q.defer();
    console.log("body", body, "account" in body);
    if (!("account" in body)) {
        Device.findByIdAndUpdate(id, body, function (err, device) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(device);
            }
        });
    } else {
        var query = {
            _id: id,
            account: body.account
        };
        console.log("query", query);
        Device.findOneAndUpdate(query, body, function (err, device) {
            console.log(err, device);
            if (device !== null) {
                deferred.resolve(device);
            } else {
                deferred.resolve({error: "Device not found"});
            }
        });
    }
    return deferred.promise;
};
deviceController.getExternalBySip = function (body) {
    var deferred = Q.defer();
    var sip = body.sip;
    var callee = body.callee;
    console.log("Find calle", sip, callee);
    Device.findOne({"sip_settings.sip.username": sip}, function (err, device) {
        if (err || device == null || device === undefined) {
            deferred.reject({error: "Device not found"});
        } else {
            if (device.use_caller_id === true) {
                var result = numberController.getExternalNumbers(callee, device);
                result.then(function (numbers) {
                    console.log("Numbers :", numbers);
                    deferred.resolve(numbers[0].number);
                }, function (error) {
                    deferred.reject({error: "Device not found"});
                })
            } else {
                console.log("Device get external ", device);
                deferred.resolve(device.sip_settings.external);
            }
        }
    });
    return deferred.promise;
};
deviceController.getDevice = function (device) {
    var deferred = Q.defer();
    console.log("get device", device);
    var query = {};
    if ("username" in device)
        query["sip_settings.sip.username"] = device.username;
    if ("name" in device)
        query.name = device.name;
    console.log("query", query);
    Device.find(query, function (err, device) {
        console.log('Device :', device.length);
        if (err || device.length === 0) {
            deferred.reject(device);
        } else {
            deferred.resolve(device);
        }
    });
    console.log(device);
    return deferred.promise;
};
deviceController.getBulkDevice = function (ids, account) {
    var deferred = Q.defer();
    var eventID = uuid.v4();
    var count = ids.length;
    console.log("count Ids: ", ids, count);
    var devices = [];
    for (var i=0; i<ids.length; i++) {
        console.log("Get Device ID: ", ids[i]);
        deviceController.getDeviceById(ids[i], account, true)
            .then(function (device) {
                console.log("Device:", device);
                deviceController.emit("deviceController:deviceRetrieved-" + eventID);
                devices.push(device);
            }, function (error) {
                console.log("Device error:", error);
                deviceController.emit("deviceController:deviceRetrieved-" + eventID);
            });
    }
    deviceController.on("deviceController:deviceRetrieved-"+eventID, function () {
        count--;
        if (count === 0){
            deferred.resolve(devices);
        }
    });
    return deferred.promise;
};
deviceController.getDeviceDyMAC = function (mac) {
    var deferred = Q.defer();
    console.log("MAC: ", mac);
    Device.findOne({"mac_address": mac}, function (err, device) {
        if (err) {
            deferred.reject(err);
        } else {
            console.log("Device: ", device);
            deferred.resolve(device);
        }
    });
    return deferred.promise;
};

/* Need to be tested */
deviceController.getInternalBySip = function (sip) {
    var deferred = Q.defer();
    console.log("sip", sip);
    Device.findOne({"sip_settings.sip.username": sip}, function (err, device) {
        if (err) {
            deferred.resolve("anounymous");
        } else {
            if (device === null) {
                console.log("sip", device, err);
                deferred.resolve("anounymous");
            } else {
                deferred.resolve(device.sip_settings.internal);
            }
        }
    });
    return deferred.promise;
};
deviceController.getDeviceByInternal = function (number) {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ deviceByInternal", number);
    var deferred = Q.defer();
    Device.findOne({"sip_settings.internal": number}, function (err, device) {
        if (device == null) {
            deferred.reject({error: "device not found!"});
        } else {
            console.log("Device found getDEviceByInternal", device);
            deferred.resolve(device);
        }
    });
    return deferred.promise;

};
deviceController.updateDevice = function (id, body) {
    console.log("id", id, "body", body);
    var deferred = Q.defer();
    Device.findByIdAndUpdate(id, body, function (err, device) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(device);
        }
        console.log(device);
    });
    return deferred.promise;
};
deviceController.updateByDevicename = function (devicename, body) {
    var deferred = Q.defer();
    Device.findOneAndUpdate(devicename, body, function (err, device) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(device);
        }
        console.log(device);
    });
    return deferred.promise;
};

deviceController.deleteDevice = function (device) {
    var deferred = Q.defer();
    Device.remove(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve("{success : Device deleted}");
        }
    });
    console.log('Device deleted!');
    return deferred.promise;
};
deviceController.deleteByDevicename = function (devicename) {
    var deferred = Q.defer();
    Device.findOneAndRemove({devicename: devicename}, function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve("{success : Device deleted}");
        }
    });
    console.log('Device deleted!');
    return deferred.promise;
};

module.exports = deviceController;
