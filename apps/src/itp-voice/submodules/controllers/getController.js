/**
 * Created by youssef on 25/07/16.
 */
var GetModel = require('mongoose').model('Get');
var request = require('request');
var Q = require('q');
var uuid = require('uuid');

var db = function () {
    var self = this;
    this.add = function (json) {
        var deferred = Q.defer();
        var newElement = new GetModel(json);
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
        GetModel.find(query, function (err, result) {
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
        GetModel.findById(id, function (err, result) {
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
    this.getVariable = function (id, account) {
        var deferred = Q.defer();
        console.log(id);
        GetModel.findOne({_id: id, account: account}, function (err, element) {
                console.log("Element: ", element);
                request({
                    "url": element.url,
                    "method": "GET"
                }, function (err, res, data) {
                    if (err) {
                        deferred.reject({error: "Error in request"});
                    } else {
                        var response = {};
                        response[element.variable_name] = data;
                        deferred.resolve(response);
                    }
                });
            });
        return deferred.promise;
    };
    this.updateById = function (id, body) {
        var deferred = Q.defer();
        GetModel.findByIdAndUpdate(id, body, function (err, result) {
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
            GetModel.findByIdAndRemove(id,function (err) {
                if (err) {
                    deferred.reject({error : "Element not found"});
                } else {
                    deferred.resolve({success : "Element deleted"});
                }
            });
        else{
            this.getById(id, accountID, check)
                .then(function(contact){
                    GetModel.findByIdAndRemove(id,function (err) {
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