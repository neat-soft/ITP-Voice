/**
 * Created by Lucas on 30/11/15.
 */
var AgentQueue = require('mongoose').model('AgentQueue');
var Devices = require('./deviceController');
var devices = Devices;
var Q = require('q');


var db = function () {
    var self = this;
    this.updateStatusAgent = function (agentId, status) {
        var deferred = Q.defer();
        var query = {"agentId": agentId};
        var update = {"status": status};
        var multi = {multi: true};
        AgentQueue.update(query, update, multi, function(err, agentQUpdated) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQUpdated);
            }
            console.log(agentQUpdated);
        });
        return deferred.promise;
    };
    /*Need Testing*/
    this.addAgentQueue = function (agentQueue) {
        console.log("addAgentQueue From Controller\n" , agentQueue);
        var newAgentQueue = new AgentQueue(agentQueue);
        var deferred = Q.defer();
        newAgentQueue.save(function (err, data) {
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
        console.log('AgentQueue saved successfully!');
    };
    this.getAQByAgentId = function (agentId) {
        console.log("******* getAQByAgentId",agentId, typeof agentId);
        var deferred = Q.defer();
        AgentQueue.find({agentId: agentId}, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
        });
        return deferred.promise;
    };
    this.getAQByQueueId = function (QId) {
        var deferred = Q.defer();
        AgentQueue.find({queueId: QId}, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log("agentQ from agentQController:",agentQueue);
        });
        return deferred.promise;
    };

    this.getAllAgentQueues = function () {
        var deferred = Q.defer();
        AgentQueue.find({}, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log(agentQueue);
        });
        return deferred.promise;
    };

    this.getAgentQueueById = function (id) {
        console.log("Get agentAgentQueue by id");
        var deferred = Q.defer();
        AgentQueue.findById(id, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log(agentQueue);
        });
        return deferred.promise;
    };

    this.getAgentQueueByExtension = function(extension){
        var deferred = Q.defer();
        AgentQueue.findOne({ extension: extension }, function(err, agentQueue) {
            if (agentQueue == null) {
                deferred.reject({ERROR:"agentAgentQueue not found!"});
            } else {
                deferred.resolve(agentQueue);
            }
        });
        return deferred.promise;
        console.log("AgentQueue By extension : ",agentQueue);

    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        AgentQueue.findByIdAndUpdate(id, body, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log("agentAgentQueue\n" + agentQueue);
        });
        return deferred.promise;

    };
    this.updateQ = function (id, body) {
        var deferred = Q.defer();
        console.log("updateQ: ",body);
        AgentQueue.findByIdAndUpdate(id,body, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log("agentAgentQueue\n" + agentQueue);
        });
        return deferred.promise;

    };
    this.addUserToQ = function (id,user) {
        console.log("add user to Q");
        var deferred = Q.defer();
        AgentQueue.findByIdAndUpdate(id, {$push: {users: user}}, {safe: true, upsert: true}, function(err, agentAgentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
        });
        return deferred.promise;
    };
    this.updateByAgentQueuename = function (agentQueue, body) {
        var deferred = Q.defer();
        AgentQueue.findOneAndUpdate(agentQueue, body, function (err, agentQueue) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(agentQueue);
            }
            console.log("agentAgentQueue:\t" + agentQueue);
        });
        return deferred.promise;
    };
    this.deleteAgentQueue = function (agentQueue) {
        var deferred = Q.defer();
        AgentQueue.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "AgentQueue deleted"});
            }
            console.log('AgentQueue deleted!');
        });
        return deferred.promise;
    };
    this.deleteByAgentQueuename = function (agentQueue) {
        var deferred = Q.defer();
        AgentQueue.findOneAndRemove(agentQueue, function (err) {
            if (err) {
                console.log("error while deleting agentAgentQueue");
                deferred.reject(err);
            } else {
                deferred.resolve({success: "AgentQueue deleted"});
            }
            console.log('AgentQueue deleted!');
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        AgentQueue.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting agentAgentQueue !"});
            } else {
                deferred.resolve({success: "AgentQueue deleted"});
            }
            console.log('AgentQueue deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;