/**
 * Created by Lucas on 30/11/15.
 */
var Queue = require('mongoose').model('Queue');
var Q = require('q');
/*
 function fetchDevicesArray(devicesArr, tabArr) {
 return devicesArr.each(function(promise, email) {
 return promise.then(function() {

 });
 });
 }, Promise.resolve());
 }*/
var db = function () {
    var self = this;

    this.getAllQueues = function (account) {
        var deferred = Q.defer();
        if (account !== undefined)
            var json = {account: account};
        else
            var json = {};
        Queue.find(json, function (err, queues) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queues);
            }
            console.log(queues);
        });
        return deferred.promise;
    };
    this.addQueue = function (queue) {
        console.log("Body : ", queue);
        var newQueue = new Queue(queue);
        var deferred = Q.defer();
        newQueue.save(function (err, data) {
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
    this.getQueueById = function (id, account) {
        var deferred = Q.defer();
        if(account === undefined){
            var json = {
                _id: id
            };
        } else {
            var json = {
                _id: id,
                account: account
            }
        }
        Queue.findOne(json, function (err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queue);
            };
        });

        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        Queue.findByIdAndUpdate(id, body, function (err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queue);
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id, account) {
        var deferred = Q.defer();
        if(account === undefined){
            var json = {
                _id: id
            };
        } else {
            var json = {
                _id: id,
                account: account
            };
        }
        Queue.remove(json, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting queue !"});
            } else {
                deferred.resolve({success: "Queue deleted"});
            }
        });
        return deferred.promise;
    };
    this.getQueueByName = function (nameQ, account) {
        var deferred = Q.defer();
        if(account === undefined){
            var json = {
                name: nameQ
            };
        } else {
            var json = {
                name: nameQ,
                account: account
            };
        }
        Queue.findOne(json, function (err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                console.log("Queue: ", queue);
                deferred.resolve(queue);
            }
        });
        return deferred.promise;
    };
    this.getQueueByExtension = function(extension, account){
        var deferred = Q.defer();
        if(account === undefined){
            var json = {
                extension: extension
            };
        } else {
            var json = {
                extension: extension,
                account: account
            };
        }
        Queue.findOne(json, function(err, queue) {
            if (queue == null) {
                deferred.reject({ERROR:"queue not found!"});
            } else {
                deferred.resolve(queue);
            }
        });
        return deferred.promise;
    };
    this.deleteByQueuename = function (queuename) {
        var deferred = Q.defer();
        console.log("Delete Queue: ", queuename);
        Queue.findOneAndRemove(queuename, function (err) {
            if (err) {
                console.log("error while deleting queue");
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Queue deleted"});
            }
        });
        return deferred.promise;
    };

    /*need to be tested*/
    this.getQueue = function (queue) {
        var deferred = Q.defer();
        Queue.findOne({queuename: queue.queuename}, function (err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queue);
            }
            console.log(queue);
        });
        return deferred.promise;
    };
    this.addUserToQ = function (id,user) {
        console.log("add user to Q");
        var deferred = Q.defer();
        Queue.findByIdAndUpdate(id, {$push: {users: user}}, {safe: true, upsert: true}, function(err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queue);
            }
        });
        return deferred.promise;
    };
    this.updateByQueuename = function (queuename, body) {
        var deferred = Q.defer();
        Queue.findOneAndUpdate(queuename, body, function (err, queue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(queue);
            }
        });
        return deferred.promise;
    };
    this.deleteQueue = function (queue) {
        var deferred = Q.defer();
        Queue.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "Queue deleted"});
            }
            console.log('Queue deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;