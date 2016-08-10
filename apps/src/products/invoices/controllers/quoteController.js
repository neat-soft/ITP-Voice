var Quotes = require('mongoose').model('Quotes');
var QuoteCustomerInfo = require('mongoose').model('QuoteCustomerInfo');

var Q = require('q');
var events = require('events');
var uuid = require('uuid');
var randomstring = require('randomstring');

var quoteController = new events.EventEmitter();

quoteController.addQuote = function (quote, isNewCustomer){
    var deferred = Q.defer();
    if ( isNewCustomer )
    {
        console.log("new customer ",isNewCustomer);
        var newQuoteCustomerInfo = QuoteCustomerInfo(quote.customerInfo);
        if ("_id" in quote.customerInfo ) delete quote.customerInfo._id;

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
        deferred.promise;
        quote.customerInfo = newQuoteCustomerInfo._id;
    }else{
        var cid = quote.customerInfo._id;
        quote.customerInfo = cid;
    }
    var newQuote = Quotes(quote);
    newQuote.save(function ( err, data){
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

quoteController.updateById = function ( id, quote){
    var deffered = Q.defer();
    Quotes.findByIdAndUpdate(id, quote, function ( err, data){
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

quoteController.getAllQuotes = function (){
    var deferred = Q.defer();
    var query = {};
    Quotes.find(query, function ( err, data){
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

quoteController.getQuoteById = function(id){
    var deferred = Q.defer();

    Quotes.findById(id, function(err, data){
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

quoteController.deleteQuoteById = function(){
    var deferred = Q.defer();

    Quotes.findByIdAndRemove(id,function ( err, data){
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
module.exports = quoteController;
