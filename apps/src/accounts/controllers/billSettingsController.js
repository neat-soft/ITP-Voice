/**
 * Created by Lucas on 15/07/16.
 */

var BillSetting = require('mongoose').model('BillSetting');
var Q = require('q');
var uuid = require('uuid');

var db = function () {
    var self = this;
    this.addBillSetting = function (billSetting) {
        var deferred = Q.defer();
        var newBillSetting = new BillSetting(billSetting);
        newBillSetting.save(function (err, data) {
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
    this.getAllBillSetting = function (billSettingID) {
        var deferred = Q.defer();
        var query = {};
        if(billSettingID)
            query= {account: billSettingID};
        BillSetting.find(query, function (err, billSettings) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(billSettings);
            }
        });
        return deferred.promise;
    };
    this.getBillSettingById = function (billSettingID, accountID, check) {
        var deferred = Q.defer();
        BillSetting.findById(billSettingID, function (err, billSetting) {
            if (err) {
                deferred.reject(err);
            }else {
                if(!check) {
                    if(billSetting)
                        if (billSetting.account.toString() === accountID.toString())
                            deferred.resolve(billSetting);
                        else
                            deferred.reject({error: "permission denied"});
                    else
                        deferred.reject({error: "permission denied"});
                }
                else {
                    if(billSetting)
                        deferred.resolve(billSetting);
                    else
                        deferred.reject({error: "BillSetting not found"});
                }
            }
        });
        return deferred.promise;
    };
    this.updateBillSetting = function (billSettingID, body) {
        var deferred = Q.defer();
        BillSetting.findByIdAndUpdate(billSettingID, body, function (err, billSetting) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(billSetting);
            }
        });
        return deferred.promise;
    };
    this.deleteBillSetting = function (billSettingID, accountID, check) {
        var deferred = Q.defer();
        if(check)
            BillSetting.findByIdAndRemove(billSettingID,function (err) {
                if (err) {
                    deferred.reject({error : "BillSetting not found"});
                } else {
                    deferred.resolve({success : "BillSetting deleted"});
                }
            });
        else{
            this.getBillSettingById(billSettingID, accountID, check)
                .then(function(contact){
                    BillSetting.findByIdAndRemove(billSettingID,function (err) {
                        if (err) {
                            deferred.reject({error : "BillSetting not found"});
                        } else {
                            deferred.resolve({success : "BillSetting deleted"});
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
