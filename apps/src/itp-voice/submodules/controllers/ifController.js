/**
 * Created by youssef on 27/07/16.
 */
var IfModel = require('mongoose').model('If');
var Q = require('q');
var uuid = require('uuid');
/*var Widget = require("./widget");
var widget = Widget;*/

var db = function () {
    var self = this;
    this.add = function (json) {
        var deferred = Q.defer();
        var newElement = new IfModel(json);
        newElement.save(function (err, data) {
            if (err) {
                console.log("err", err);
                deferred.reject(err);
            } else {
                console.log("data", data);
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    };
    this.getAll = function (id) {
        var deferred = Q.defer();
        var query = {};
        if(id)
            query= {accountID: id};
        IfModel.find(query, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    };
    this.getById = function (id, accountID, check) {
        var deferred = Q.defer();
        IfModel.findById(id, function (err, result) {
            if (err) {
                deferred.reject(err);
            }else {
                if(!check) {
                    if(result)
                        if (result.account.toString() === accountID.toString())
                            deferred.resolve(result);
                        else
                            deferred.reject({error: "permission denied"});
                    else
                        deferred.reject({error: "permission denied"});
                }
                else {
                    if(result)
                        deferred.resolve(result);
                    else
                        deferred.reject({error: "Element not found"});
                }
            }
        });
        return deferred.promise;
    };
    this.getExpression = function (id) {
        var deferred = Q.defer();
        IfModel.findById(id, function (err, result) {
            if (err)
                deferred.reject(err);
            else
                deferred.resolve(result.expression);
        });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        IfModel.findByIdAndUpdate(id, body, function (err, result) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(result);
            }
        });
        return deferred.promise;
    };
    this.deleteById = function (id, accountID, check) {
        var deferred = Q.defer();
        if(check)
            IfModel.findByIdAndRemove(id,function (err) {
                if (err) {
                    deferred.reject({error : "Element not found"});
                } else {
                    deferred.resolve({success : "Element deleted"});
                }
            });
        else{
            this.getById(id, accountID, check)
                .then(function(){
                    IfModel.findByIdAndRemove(id,function (err) {
                        if (err) {
                            deferred.reject({error : "Element not found"});
                        } else {
                            deferred.resolve({success : "Element deleted"});
                        }
                    });
                }, function(err){
                    deferred.reject(err);
                });
        }
        return deferred.promise;
    };
};
module.exports = db;