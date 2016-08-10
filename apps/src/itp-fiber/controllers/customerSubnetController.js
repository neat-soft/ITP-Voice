var CustomerSubnets = require('mongoose').model('CustomerSubnets');

var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var customerSubnetController = new events.EventEmitter();



//////
customerSubnetController.addCustomerSubnet = function( customerSubnet )
{
    var newCustomerSubnet = new CustomerSubnets(customerSubnet);
    var deferred = Q.defer();

    newCustomerSubnet.save( function (error, data){
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

customerSubnetController.updateCustomerSubnet = function ( id, customerSubnet ){
    var deferred = Q.defer();
    CustomerSubnets.findByIdAndUpdate(id, customerSubnet, function (err, data){
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

customerSubnetController.getAllCustomerSubnets = function (){
    var deferred = Q.defer();
    var query = {};

    CustomerSubnets.find(query,function (err, service){
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

customerSubnetController.getCustomerSubnetById = function ( id )
{
    var deferred = Q.defer();

    CustomerSubnets.findById(id, function (err, service){
        if ( err )
        {
            deferred.reject(err);
        }else{
            deferred.resolve(service);
        }
    });
    return deferred.promise;
};

customerSubnetController.deleteCustomerSubnetById = function ( id )
{
    var deferred = Q.defer();
    
    CustomerSubnets.findByIdAndRemove(id, function ( err, data){
        if ( err ) deferred.reject(err);
        else deferred.resolve(data);
    });
    return deferred.promise;
};

module.exports = customerSubnetController;