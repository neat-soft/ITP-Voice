/**
 * Created by Lucas on 30/11/15.
 */
var FeatureCode = require('mongoose').model('FeatureCode');
var Devices = require('./deviceController');
var devices = Devices;
var Menu = require('./menuController');
var menu = new Menu();
var Numbers = require('./numberController');
var numbers = new Numbers();
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
    this.addFeatureCode = function (featureCode) {
        console.log("addFeatureCode From Controller\n" , featureCode);
        var newFeatureCode = new FeatureCode(featureCode);
        var deferred = Q.defer();
        newFeatureCode.save(function (err, data) {
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
        console.log('FeatureCode saved successfully!');
    };
    this.getAllFeatureCodes = function () {
        var deferred = Q.defer();
        FeatureCode.find({}, function (err, featureCodes) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCodes);
            }
            console.log(featureCodes);
        });
        return deferred.promise;
    };
    this.getFeatureCode = function (featureCode) {
        var deferred = Q.defer();
        console.log("featureCode:", featureCode);
        if(typeof featureCode !== "object" || (!"code" in featureCode && !"account" in featureCode))
            setTimeout(function () {
                deferred.reject({error: "FeatureCode not found!"});
            }, 0);
        else
        {
            console.log("featureCode:", featureCode);
            FeatureCode.findOne(featureCode, function (err, featureCode) {
                if (err) {
                    deferred.reject(err);
                } else {
                    if (featureCode == null) {
                        deferred.reject({error: "FeatureCode not found!"});
                    } else {
                        console.log("FeatureCode found getFeatureCode", featureCode);
                        deferred.resolve(featureCode);
                    }
                }
            });
        }
        return deferred.promise;
    };
    this.getFeatureCodeById = function (id) {
        console.log("Get featureCode by id");
        var deferred = Q.defer();
        FeatureCode.findById(id, function (err, featureCode) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCode);
            }
            console.log(featureCode);
        });
        return deferred.promise;
    };

    this.getFeatureCodeByExtension = function(extension){
        var deferred = Q.defer();
        FeatureCode.findOne({ extension: extension }, function(err, featureCode) {
            if (featureCode == null) {
                deferred.reject({ERROR:"featureCode not found!"});
            } else {
                deferred.resolve(featureCode);
            }
        });
        return deferred.promise;
        console.log("FeatureCode By extension : ",featureCode);

    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        FeatureCode.findByIdAndUpdate(id, body, function (err, featureCode) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCode);
            }
            console.log("featureCode\n" + featureCode);
        });
        return deferred.promise;

    };
    this.updateQ = function (id, body) {
        var deferred = Q.defer();
        console.log("updateQ: ",body);
        FeatureCode.findByIdAndUpdate(id,body, function (err, featureCode) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCode);
            }
            console.log("featureCode\n" + featureCode);
        });
        return deferred.promise;

    };
    this.addUserToQ = function (id,user) {
        console.log("add user to Q");
        var deferred = Q.defer();
        FeatureCode.findByIdAndUpdate(id, {$push: {users: user}}, {safe: true, upsert: true}, function(err, featureCode) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCode);
            }
        });
        return deferred.promise;
    };
    this.updateByFeatureCodename = function (featureCodename, body) {
        var deferred = Q.defer();
        FeatureCode.findOneAndUpdate(featureCodename, body, function (err, featureCode) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(featureCode);
            }
            console.log("featureCode:\t" + featureCode);
        });
        return deferred.promise;
    };
    this.deleteFeatureCode = function (featureCode) {
        var deferred = Q.defer();
        FeatureCode.remove(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({success: "FeatureCode deleted"});
            }
            console.log('FeatureCode deleted!');
        });
        return deferred.promise;
    };
    this.deleteByFeatureCodename = function (featureCodename) {
        var deferred = Q.defer();
        FeatureCode.findOneAndRemove(featureCodename, function (err) {
            if (err) {
                console.log("error while deleting featureCode");
                deferred.reject(err);
            } else {
                deferred.resolve({success: "FeatureCode deleted"});
            }
            console.log('FeatureCode deleted!');
        });
        return deferred.promise;
    };
    this.deleteById = function (id) {
        var deferred = Q.defer();
        FeatureCode.findByIdAndRemove(id, function (err) {
            if (err) {
                deferred.reject({error: "error while deleting featureCode !"});
            } else {
                deferred.resolve({success: "FeatureCode deleted"});
            }
            console.log('FeatureCode deleted!');
        });
        return deferred.promise;
    };
};

module.exports = db;