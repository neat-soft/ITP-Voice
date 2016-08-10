/**
 * Created by Lucas on 30/11/15.
 */
var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var Ivr = require('mongoose').model('Ivr');
var Devices = require('./deviceController');
var devices = Devices;
var RGroupes = require('./ringGroupController');
var rgroupes = new RGroupes();
var Menu = require('./menuController');
var Numbers = require('./numberController');
var Queues = require('./queueController');
var Users = require('./../../../users/controllers/userController');
var Get = require('./getController');
var IfController = require('./ifController');
var Widget = require('./widget');
var menu = new Menu();
var numbers = new Numbers();
var queues = new Queues();
var users = new Users();
var get = new Get();
var widget = Widget;
var ifController = new IfController();
var ivrController = new events.EventEmitter();

ivrController.addIvr = function (ivr) {
    var newIvr = new Ivr(ivr);
    var deferred = Q.defer();
    newIvr.save(function (err, data) {
        if (err) {
            deferred.reject(err);
            console.log(err);
        }
        else {
            console.log(data);
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};
ivrController.getAllIvrs = function () {
    var deferred = Q.defer();
    Ivr.find({}, function (err, ivrs) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(ivrs);
        }
        console.log(ivrs);
    });
    return deferred.promise;
};
ivrController.listIvrsByAccount = function (accountID) {
    var deferred = Q.defer();
    console.log({account: accountID});
    Ivr.find({account: accountID}, function (err, data) {
        if (err) {
            deferred.reject({error: "error listing Ivr by account"});
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};
ivrController.updateById = function (id, body) {
    var deferred = Q.defer();
    console.log("body", body, "account" in body);
    if (!("account" in body)) {
        Ivr.findByIdAndUpdate(id, body, function (err, ivr) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(ivr);
            }
        });
    } else {
        var query = {
            _id: id,
            account: body.account
        };
        console.log("query", query);
        Ivr.findOneAndUpdate(query, body, function (err, ivr) {
            console.log(err, ivr);
            if (ivr !== null) {
                deferred.resolve(ivr);
            } else {
                deferred.resolve({error: "Ivr not found"});
            }
        });
    }
    return deferred.promise;

};
ivrController.getIvrById = function (id, account) {
    console.log("Get user by id");
    var deferred = Q.defer();
    Ivr.findById(id, function (err, ivr) {
        if (err || !ivr) {
            deferred.reject({error: "Ivr not found"});
        } else {
            if (account === undefined || account.toString() === ivr.account.toString()) {
                deferred.resolve(ivr);
            } else {
                deferred.reject({error: "Ivr not found"});
            }
        }
    });
    return deferred.promise;
};
ivrController.deleteById = function (id, account) {
    var deferred = Q.defer();
    console.log("deleteById", id, account);
    if (account === undefined) {
        var json = {
            _id: id
        }
        Ivr.findOneAndRemove(json, function (err, ivr) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(ivr);
            }
        });
    } else {
        var query = {
            _id: id,
            account: account
        };
        console.log("query", query);
        Ivr.findOneAndRemove(query, function (err, ivr) {
            console.log(err, ivr);
            if (ivr !== null) {
                deferred.resolve(ivr);
            } else {
                deferred.resolve({error: "User not found"});
            }
        });
    }
    return deferred.promise;
};
/*-----------------------------------------*/
ivrController.getIvr = function (ivr) {
    var deferred = Q.defer();
    Ivr.findOne({ivrname: ivr.ivrname}, function (err, ivr) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(ivr);
        }
        console.log(ivr);
    });
    return deferred.promise;
};
/*ivrController.getIvrById = function (id) {
 console.log("Get ivr by id");
 var deferred = Q.defer();
 Ivr.findById(id, function (err, ivr) {
 if (err) {
 deferred.reject(err);
 } else {
 deferred.resolve(ivr);
 }
 console.log(ivr);
 });
 return deferred.promise;
 };*/
ivrController.getIvrByNumber = function (number, account, step) {
    console.log("inside get Ivr by number", number, account, step);
    var deferred = Q.defer();
    var queryIvr = Ivr.findOne({numbers: number, account: account});
    queryIvr.then(function (ivr) {
        console.log("ivr find One: ", ivr);
        if (ivr == null || ivr === 'undefined') {
            deferred.reject({ERROR: "Ivr not Found"});
        } else {
            console.log("ivr.module before: ", ivr.module);
            var modules = ivr.module;
            var count = modules.length;
            var check = true;
            modules.forEach(function(element, index) {
                if(element.order === step.order){
                    if(step.position === "children")
                        if("children" in element)
                            element = element.children;
                        else
                            deferred.reject({error: "children not found"});
                    widget[element.type](element.id, account)
                        .then(function(result) {
                            deferred.resolve(result);
                        }, function (err) {
                            deferred.resolve(ivr);
                            console.log("Ivr does not have any type of module", err);
                        });
                    check = false
                }else{
                    if(count-1 == index && check){
                        console.log("No more steps");
                        deferred.reject({error: "No more steps"});
                    }
                }
            });
        }
    }, function (error) {
        console.log("ERROR getSCenario by number: ", error);
    });
    return deferred.promise;
};

ivrController.updateByIvrname = function (ivrname, body) {
    var deferred = Q.defer();
    Ivr.findOneAndUpdate(ivrname, body, function (err, ivr) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(ivr);
        }
        console.log("ivr:\t" + ivr);
    });
    return deferred.promise;
};
ivrController.deleteIvr = function (ivr) {
    var deferred = Q.defer();
    Ivr.remove(function (err) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve({success: "Ivr deleted"});
        }
        console.log('Ivr deleted!');
    });
    return deferred.promise;
};
ivrController.deleteByIvrname = function (ivrname) {
    var deferred = Q.defer();
    Ivr.findOneAndRemove(ivrname, function (err) {
        if (err) {
            console.log("error while deleting ivr");
            deferred.reject(err);
        } else {
            deferred.resolve({success: "Ivr deleted"});
        }
        console.log('Ivr deleted!');
    });
    return deferred.promise;
};

module.exports = ivrController;