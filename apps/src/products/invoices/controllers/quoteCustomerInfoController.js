var QuoteCustomerInfo = require('mongoose').model('QuoteCustomerInfo');

var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var quoteCustomerInfoController = new events.EventEmitter();

quoteCustomerInfoController.addQuoteCustomerInfo = function (quoteCustomerInfo){
    var deferred = Q.defer();

    var newQuoteCustomerInfo = QuoteCustomerInfo(quoteCustomerInfo);
    newQuoteCustomerInfo.save(function ( err, data){
        if ( err )
        {
            deferred.reject(err);
            console.log(err);
        }else{
            deferred.resolve(data);
            console.log(data);
        }
    });
    return deferred.promise;
};

quoteCustomerInfoController.getAllQuotCustomerInfo = function (){
    var deferred = Q.defer();
    var query = {};
    QuoteCustomerInfo.find(query, function ( err, data){
        if ( err )
        {
            deferred.reject(err);
            console.log(err);
        }else{
            deferred.resolve(data);
            console.log(data);
        }
    });
    return deferred.promise;
};


module.exports = quoteCustomerInfoController;