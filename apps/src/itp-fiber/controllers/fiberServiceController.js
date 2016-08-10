var FiberService = require('mongoose').model('FiberService');
var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var fiberServiceController = new events.EventEmitter();


fiberServiceController.addService = function( fiberService ){
    var newService = new FiberService(fiberService);
    var deferred = Q.defer();

    newService.save( function (error, data){
        if (error){
            deferred.reject(error);
            console.log(error);
        }else{
            console.log(data);
            deferred.resolve(data);
        }
    });
    
    return deferred.promise; 
};

fiberServiceController.updateById = function ( id, service){
    var deferred = Q.defer();
    if ( !("accountid" in service)){
        FiberService.findByIdAndUpdate(id, service, function (err, data){
            if ( err ){
                console.log("error:",err);
                deferred.reject(err);
            }else{
                console.log("service:",data);
                deferred.resolve(data);
            }
        });
    }else{
        var query = {
            _id: id,
            accountid: service.accountid
        };
        console.log("query",query);
        FiberService.findOneAndUpdate( query, service, function (err, data){
            console.log("error: ",err,"fiberDevice:", data);
            if ( data !== null){
                deferred.resolve(data);
            }else{
                deferred.resolve({error: "Service not found"});
            }
        });
    }
    return deferred.promise;
};

fiberServiceController.getAllService = function (account){
    var deferred = Q.defer();

    if ( account != undefined) var query = {accountid : account};
    else var query = {};

    FiberService.find(query,function (err, service){
        if ( err )
        {
            deferred.reject(err);
        }else 
        {
            deferred.resolve(service);
        }
    });
    return deferred.promise;
};
fiberServiceController.getServiceById = function ( id )
{
    var deferred = Q.defer();

    FiberService.findById(id, function (err, service){
        if ( err )
        {
            deferred.reject(err);
        }else{
            deferred.resolve(service);
        }
    });
    return deferred.promise;
};
fiberServiceController.deleteById = function ( id, account)
{
    var deferred = Q.defer();
    console.log("delete serviceID :" , id);
    if ( account === undefined)
    {
        FiberService.findByIdAndRemove(id, function ( err, data){
            if ( err ) deferred.reject(err);
            else deferred.resolve(data);
        });
    }else{
        var query = {
            _id: id,
            accountid: account
        };
        console.log("query: ",query);
        FiberService.findOneAndRemove(query, function (err, data){
            if ( err ) deferred.reject(err);
            else deferred.resolve(data);
        });
    }
    return deferred.promise;
};
module.exports = fiberServiceController;