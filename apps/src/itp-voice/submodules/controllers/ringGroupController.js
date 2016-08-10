/**
 * Created by Lucas on 30/11/15.
 */
var RingGroup = require('mongoose').model('RingGroup');
var Q = require('q');

var db = function () {
    var self = this;
    this.addRingGroup = function (ringGroup) {
        console.log("addRingGroup From Controller\n"+ringGroup);
        var newRingGroup = new RingGroup(ringGroup);
        var deferred = Q.defer();
        newRingGroup.save(function (err, data) {
            if (err) {
                deferred.reject(err);
                console.log(err);
            } else {
                console.log(data);
                console.log('RingGroup saved successfully!');
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        console.log("body", body, "account" in body);
        if (!("account" in body)) {
            RingGroup.findByIdAndUpdate(id, body, function (err, rg) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(rg);
                }
            });
        } else {
            var query = {
                _id: id,
                account: body.account
            };
            console.log("query", query);
            RingGroup.findOneAndUpdate(query, body, function (err, rg) {
                console.log(err, rg);
                if (rg !== null) {
                    deferred.resolve(rg);
                } else {
                    deferred.resolve({error : "RG not found"});
                }
            });
        }
        return deferred.promise;

    };
    this.getAllRingGroups = function () {
        var deferred = Q.defer();
        RingGroup.find({}, function (err, rgs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(rgs);
            }
            console.log(rgs);
        });
        return deferred.promise;
    };
    this.listRingGroupsByAccount = function (accountID) {
        var deferred = Q.defer();
        console.log({account: accountID});
        RingGroup.find({account: accountID}, function (err, data) {
            if (err) {
                deferred.reject({error:"error listing RingGroups by account"});
            } else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getRingGroupById = function (id, account) {
        var deferred = Q.defer();
        RingGroup.findOne({_id: id, account: account}, function (err, rg) {
            if (err || !rg) {
                deferred.reject({error : "RG not found"});
            } else {
                deferred.resolve(rg);
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id, account) {
        var deferred = Q.defer();
        console.log("deleteById", account);
        if (account === undefined) {
            RingGroup.findByIdAndRemove(id, function (err, rg) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(rg);
                }
            });
        } else {
            var query = {
                _id: id,
                account: account
            };
            console.log("query", query);
            RingGroup.findOneAndRemove(query, function (err, rg) {
                console.log(err, rg);
                if (rg !== null) {
                    deferred.resolve(rg);
                } else {
                    deferred.resolve({error : "RG not found"});
                }
            });
        }
        return deferred.promise;
    };


    /*-----------------------------------------*/
    this.getRingGroup = function (ringGroup) {
        var deferred = Q.defer();
        RingGroup.findOne({ringGroupname: ringGroup.ringGroupname}, function (err, ringGroup) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(ringGroup);
            }
            console.log(ringGroup);
        });
        return deferred.promise;
    };
    this.getRingGroupByNumber = function(number){
        console.log("Get ringGroup by number");
        var deferred = Q.defer();
        var json = {};
        RingGroup.findOne({numbers:number}, function (err, ringGroup) {
            if (err) {
                deferred.reject(err);
            } else {
                console.log("ringGroup.module before: ",ringGroup.module);
                if(ringGroup.type === 'device'){
                    var resultDevice = devices.getDeviceById(ringGroup.module);
                    resultDevice.then(function (device) {
                        console.log("resultDevice: ",device);
                        json = {
                            "module":device,
                            "type":ringGroup.type,
                            "_id":ringGroup._id
                        };
                        deferred.resolve(json);
                    }, function (error) {
                        console.log(error);
                    });
                }


            }
            console.log(ringGroup);
        });
        return deferred.promise;

    };
    this.updateByRingGroupname = function (ringGroupname, body) {
        var deferred = Q.defer();
        RingGroup.findOneAndUpdate(ringGroupname, body, function (err, ringGroup) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(ringGroup);
            }
            console.log("ringGroup:\t"+ringGroup);
        });
        return deferred.promise;
    };
    this.deleteRingGroup = function (ringGroup) {
        var deferred = Q.defer();
        RingGroup.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success : "RingGroup deleted"});
            }
            console.log('RingGroup deleted!');
        });
        return deferred.promise;
    };
    this.deleteByRingGroupname = function (ringGroupname) {
        var deferred = Q.defer();
        RingGroup.findOneAndRemove(ringGroupname, function (err) {
            if (err) {
                console.log("error while deleting ringGroup");
                deferred.reject(err);
            } else {
                deferred.resolve({success : "RingGroup deleted"});
            }
            console.log('RingGroup deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;