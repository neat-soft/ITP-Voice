/**
 * Created by Lucas on 18/01/16.
 */
var ActiveCall = require('mongoose').model('ActiveCall');
var Q = require('q');
var db = function(){
    var self = this;
    this.addActiveCall = function (activeCall) {
        console.log("Active Call to add:", activeCall);
        var newActiveCall = new ActiveCall(activeCall);
        var deferred = Q.defer();
        newActiveCall.save(function (err, data) {
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
    this.getAllActiveCalls = function () {
        var deferred = Q.defer();
        ActiveCall.find({}, function(err, activeCalls) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCalls);
            }
        });
        console.log(activeCalls);
        return deferred.promise;
    };
    this.getActiveCall = function(activeCall){
        var deferred = Q.defer();
        ActiveCall.find(activeCall, function(err, activeCall) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCall);
            }
            console.log(activeCall);
        });
        return deferred.promise;
    };
    this.getActiveCallById = function(json) {
        var deferred = Q.defer();
        console.log("//////////////Query Active Call:", json);
        if(json.direction === "incoming"){
            var query = { from_id: json.holdID };
        }else if(json.direction === "outgoing"){
            var query = { to_id: json.holdID };
        }
        console.log("Query Active Call:", query);
        ActiveCall.findOne(query, function(err, activeCall) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCall);
            }
        });
        return deferred.promise;
    };
    this.getActiveCallByFromTo = function(from,to) {
        var deferred = Q.defer();
        ActiveCall.findOne({"from_id":from,"to_id": to}, function(err, activeCall) {
	    console.log(err, activeCall);
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCall);
            }
        });
        return deferred.promise;
    };
    this.getActiveCallByNumber = function(number) {
        var deferred = Q.defer();
        var query = { $or: [{'from_uri': number},{'to_uri': number}]};
        ActiveCall.find(/*{ $or:[ {'from_uri':number}, {'to_uri':number} ]}*/ query, function(err, activeCalls) {
            if (err) {
                deferred.reject(err);
                console.log("**************************************getActiveCallByNumberError:",activeCalls);
            } else {
                console.log("**************************************getActiveCallByNumber:",activeCalls);
                deferred.resolve(activeCalls);
            }
        });
        return deferred.promise;
    };
    this.updateActiveCall = function(id,body) {
        var deferred = Q.defer();
        ActiveCall.findByIdAndUpdate(id, body, function(err, activeCall) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCall);
            }
            console.log(activeCall);
        });
        return deferred.promise;
    };
    this.updateOrAddActiveCall = function(model, body) {
        var deferred = Q.defer();
        ActiveCall.findOne(model, function(err, activeCall) {
            if (err) {
                console.log("error update add ActiveCall",err);
                deferred.reject(err);
            } else {
                if(activeCall !== null) {
                    var idActiveCall = activeCall._id;
                    var resultActiveCall = self.updateActiveCall(idActiveCall,body);
                    resultActiveCall.then(function(activeCallUpdated){
                        deferred.resolve(activeCallUpdated);
                    });
                }
                else {
                    var activeCallToAdd = {
                        from_id: model.from_id,
                        to_id: model.to_id
                    };
                    var resultAddedCL = self.addActiveCall(activeCallToAdd);
                    resultAddedCL.then(function(activeCallAdded){
                        var idCL = activeCallAdded._id;
                        var resultUpdatedCL = self.updateActiveCall(idCL,body);
                        resultUpdatedCL.then(function(activeCallFinal){
                            deferred.resolve(activeCallFinal);
                        });

                    });
                }
            }
        });
        return deferred.promise;
    };
    this.updateById = function(id,body) {
        var deferred = Q.defer();
        ActiveCall.findByIdAndUpdate(id, body, function(err, activeCall) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(activeCall);
            }
            console.log(activeCall);
        });
        return deferred.promise;
    };
    this.deleteActiveCall = function(from, to) {
        var deferred = Q.defer();
	var self = this;
	console.log("this.deleteActiveCall");
        resultAC = self.getActiveCallByFromTo(from,to);
        resultAC.then(function(activeCall){
	     if (activeCall) {
		resultDeleteAC = self.deleteById(activeCall._id);
             	resultDeleteAC.then(function(deletedAC){
                	console.log("deletedAC", deletedAC);
                	deferred.resolve({success: "ActiveCall deleted"});
             	}, function(error) {
                	console.log("deletedAC error", errror);
                	deferred.reject(error);
             	});
	     } else {
		 deferred.reject({error: "ActiveCall not found"});
	     }
        }, function (error){
             deferred.reject(error);
	     console.log("unable to find active call");
	});
        return deferred.promise;
    };
    this.deleteById  = function(id) {
        var deferred = Q.defer();
        ActiveCall.findByIdAndRemove(id, function(err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve("{success : ActiveCall deleted}");
            }
        });
        console.log('ActiveCall deleted!');
        return deferred.promise;
    };
};

module.exports = db;
