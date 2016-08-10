/**
 * Created by Lucas on 18/01/16.
 */
var CallLog = require('mongoose').model('CallLog');
var Q = require('q');
var db = function(){
    var self = this;
    this.updateOrAddCallLog = function(model, body) {
        var deferred = Q.defer();
        CallLog.findOne(model, function(err, callLog) {
            if (err) {
                console.log("error update add CallLog",err);
                deferred.reject(err);
            } else {
                if(callLog !== null) {
                    var idCallLog = callLog._id;
                    var resultCallLog = self.updateCallLog(idCallLog,body);
                    resultCallLog.then(function(callLogUpdated){
                        console.log("Calllog updated: ", callLogUpdated);
                        deferred.resolve(callLogUpdated);
                    });
                }
                else {
                    var callLogToAdd = {
                        from_id: model.from_id,
                        to_id: model.to_id,
                        account: model.account
                    };
                    var resultAddedCL = self.addCallLog(callLogToAdd);
                    resultAddedCL.then(function(callLogAdded){
                        var idCL = callLogAdded._id;
                        console.log("Calllog added: ", callLogAdded);
                        var resultUpdatedCL = self.updateCallLog(idCL,body);
                        resultUpdatedCL.then(function(callLogFinal){
                            console.log("Calllog reupdated: ", callLogFinal);
                            deferred.resolve(callLogFinal);
                        });
                    });
                }
            }
        });
        return deferred.promise;
    };
    this.getCallLogByFromTo = function(from, to, account, check) {
        var deferred = Q.defer();
        if (check) {
            CallLog.findOne({"from_id":from,"to_id": to, "account": account}, function(err, callLog) {
                if (err) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(callLog);
                }
            });
        } else {
            CallLog.findOne({"from_id":from,"to_id": to}, function(err, callLog) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(callLog);
                }
            });
        }
        return deferred.promise;
    };
    this.getCallLogByFrom = function(from, account, check) {
        var deferred = Q.defer();
        if (check) {
            CallLog.find({"from_id":from, "account": account}, function(err, callLog) {
                if (err) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(callLog);
                }
            });
        } else {
            CallLog.find({"from_id":from}, function(err, callLog) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(callLog);
                }
            });
        }
        return deferred.promise;
    };

    /* need to be tested */
    this.getAllCallLogs = function (account) {
        var deferred = Q.defer();
        if (account !== undefined)
            var json = {account: account};
        else
            var json = {};
        CallLog.find(json, function(err, callLogs) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(callLogs);
            }
        });
        console.log(callLogs);
        return deferred.promise;
    };
    this.getCallLogById = function (id, account, check) {
        var deferred = Q.defer();
        if (check) {
            CallLog.find({"_id": id, "account": account}, function (err, callLog) {
                if (err) {
                    deferred.reject(error);
                } else {
                    deferred.resolve(callLog);
                }
            });
        } else {
            CallLog.findById(id, function (err, callLog) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(callLog);
                }
            });
        }
        return deferred.promise;
    };
    this.getCallLogByNumber = function(number, account, check) {
        var deferred = Q.defer();
        if (check) {
            var calllogChecked = []
            CallLog.find({ $or:[ {'from_uri':number}, {'to_uri':number} ]}, function(err, callLogs) {
                if (err) {
                    deferred.reject(error);
                } else if (callLogs.length > 0){
                    callLogs.forEach(function (calllog, index, array) {
                        if (calllog.account.toString() === account.toString()) {
                            calllogChecked.push(calllog);
                        }
                        if(index === array.length)
                            deferred.resolve(calllogChecked);
                    })
                } else
                    deferred.reject({"status": "nok", "response": "you can't query calllogController calllogs"});
            });
        } else {
            CallLog.find({ $or:[ {'from_uri':number}, {'to_uri':number} ]}, function(err, callLogs) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(callLogs);
                }
            });
        }
        return deferred.promise;
    };
    this.addCallLog = function (callLog) {
        var newCallLog = new CallLog(callLog);
        var deferred = Q.defer();
        newCallLog.save(function (err, data) {
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
    this.updateCallLog = function(id,body) {
        var deferred = Q.defer();
        CallLog.findByIdAndUpdate(id, body, function(err, callLog) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(callLog);
            }
            console.log(callLog);
        });
        return deferred.promise;
    };
    this.getCallLog = function(callLog){
        var deferred = Q.defer();
        CallLog.find(callLog, function(err, callLog) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(callLog);
            }
            console.log(callLog);
        });
        return deferred.promise;
    };
    this.updateById = function(id,body) {
        var deferred = Q.defer();
        CallLog.findByIdAndUpdate(id, body, function(err, callLog) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(callLog);
            }
            console.log(callLog);
        });
        return deferred.promise;
    };
    this.deleteCallLog = function(callLog) {
        var deferred = Q.defer();
        CallLog.remove(function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("{success : CallLog deleted}");
            }
        });
        console.log('CallLog deleted!');
        return deferred.promise;
    };
    this.deleteByCallLogname  = function(callLogname) {
        var deferred = Q.defer();
        CallLog.findOneAndRemove({ callLogname: callLogname}, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("{success : CallLog deleted}");
            }
        });
        console.log('CallLog deleted!');
        return deferred.promise;
    };
    this.deleteById  = function(id) {
        var deferred = Q.defer();
        CallLog.findByIdAndRemove(id, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("{success : CallLog deleted}");
            }
        });
        console.log('CallLog deleted!');
        return deferred.promise;
    };
};

module.exports = db;