var ITPSubnets = require('mongoose').model('ITPSubnets');

var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var itpSubnetController = new events.EventEmitter();




itpSubnetController.addITPSubnet = function( itpSubnet ){
    var newITPSubnet = new ITPSubnets(itpSubnet);
    var deferred = Q.defer();

    newITPSubnet.save( function (error, data){
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
itpSubnetController.updateITPSubnet = function ( id, itpSubnet){
    var deferred = Q.defer();
    ITPSubnets.findByIdAndUpdate(id, itpSubnet, function (err, data){
        if ( err ){
            console.log("error:",err);
            deferred.reject(err);
        }else{
            console.log("service:",data);
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};

itpSubnetController.getAllITPSubnets = function (){
    var deferred = Q.defer();
    var query = {};

    ITPSubnets.find(query,function (err, service){
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
itpSubnetController.getITPSubnetById = function ( id )
{
    var deferred = Q.defer();

    ITPSubnets.findById(id, function (err, service){
        if ( err )
        {
            deferred.reject(err);
        }else{
            deferred.resolve(service);
        }
    });
    return deferred.promise;
};

itpSubnetController.deleteITPSubnetById = function ( id )
{
    var deferred = Q.defer();
    
    ITPSubnets.findByIdAndRemove(id, function ( err, data){
        if ( err ) deferred.reject(err);
        else deferred.resolve(data);
    });
    return deferred.promise;
};

module.exports = itpSubnetController;