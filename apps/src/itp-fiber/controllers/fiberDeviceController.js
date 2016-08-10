/**
 * Created by Lucas on 12/07/17.
 */

var FiberDevice = require('mongoose').model('FiberDevice');
var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var fiberDeviceController = new events.EventEmitter();

fiberDeviceController.addDevice = function( fiberDevice ){
    var newDevice = new FiberDevice(fiberDevice);
    var deferred = Q.defer();
    var curDate = new Date();
    newDevice.activatedDate = curDate;
    newDevice.save( function (error, data){
        if (error){
            deferred.reject(error);
            console.log(error);
        }else{
            console.log(data);
            deferred.resolve(data);
        }
    });
    console.log('FiberDevice saved successfully!');
    return deferred.promise; 
};
fiberDeviceController.getAllDevices = function( account ){
    var deferred = Q.defer();
    if ( account != undefined)
    	var json = {accountid : account};
    else var json = {};
    FiberDevice.find(json, function ( err, devices){
        if ( err ){
            deferred.reject(err);
        }else {
            deferred.resolve(devices);
        }
    });
    return deferred.promise;
};
fiberDeviceController.getDeviceById = function ( id ){
    var deferred = Q.defer();
    FiberDevice.findById(id, function (err, device){
        if(err){
            deferred.reject(err);
        }else {
            deferred.resolve(device);
        }
    });
    return deferred.promise;
};
fiberDeviceController.getDeviceById = function ( id, accout, check){
    var deferred = Q.defer();
    if ( check ){
        FiberDevice.findById(id, function (err, device){
            if( err ){
                deferred.reject(error);
            }else if ( device.account.toString() !== account.toString() ){
                console.log("Account, device.account: ",account, device.account);
                deferred.reject({"status":"nok","response":"cant query fiberDeviceController Device"});
            }else {
                deferred.resolve(device);
            }
        });
    }else{
        FiberDevice.findById(id, function (err, device){
            if(err){
                deferred.reject(err);
            }else {
                deferred.resolve(device);
            }
        });
    }
    return deferred.promise;
};
fiberDeviceController.deleteById = function(id, account){
    var deferred = Q.defer();
    console.log("deleteById", account);
    if ( account === undefined){
        FiberDevice.findByIdAndRemove(id, function(err, device){
            if ( err){
                deferred.reject(err);
            }else{
                deferred.resolve(device);
            }
        });
    }else{
        var query = {
            _id: id,
            account : account
        };
        console.log("query", query);
        FiberDevice.findOneAndRemove(query,function (err, device){
            console.log(err, device);
            if ( device !== null){
                deferred.resolve(device);
            }else{
                deferred.resolve({error: "User not found"});
            }
        });
    }
    return deferred.promise;
};
fiberDeviceController.updateById  = function(id, body){
    var deferred = Q.defer();
    console.log("body", body, "accountid" in body);
    if ( !("accountid" in body)){
        FiberDevice.findByIdAndUpdate(id, body, function (err, device){
            if ( err ){
                console.log("error:",err);
                deferred.reject(err);
            }else{
                console.log("device:",device);
                deferred.resolve(device);
            }
        });
    }else{
        var query = {
            _id: id,
            accountid: body.accountid
        };
        console.log("query",query);
        FiberDevice.findOneAndUpdate( query, body, function (err, device){
            console.log("error: ",err,"fiberDevice:", device);
            if ( device !== null){
                deferred.resolve(device);
            }else{
                deferred.resolve({error: "Device not found"});
            }
        });
    }
    console.log("fiberdevice updatebyid!!!!!");
    return deferred.promise;
};

module.exports = fiberDeviceController;