/**
 * Created by Lucas on 12/07/17.
 */
var express = require('express');
var router = express.Router();

var Quote = require('../../controllers/quoteController');
var QuoteCustomerInfoes = require ('../../controllers/quoteCustomerInfoController');
var quotes = Quote;
var qutoCustomerInfoes = QuoteCustomerInfoes; 

router.post('/quotes/:isNewCustomer',function ( req, res, next){
    console.log("add/update quote");
    var quote = req.body;
    var isNewCustomer = req.params.isNewCustomer;
    if ( "_id" in quote)
    {
        var id = quote._id;
        delete quote._id;
        var result = quotes.updateById(id, quote);
    }else 
    {
        var result = quotes.addQuote( quote , isNewCustomer );
    }

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/quotes', function (req, res, next) {
    console.log("get all quote");
    var result = quotes.getAllQuotes();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/quotes/:id',function (req, res, next) {
    var id = req.params.id;
    console.log("get quote by id: ",id);
    var result = quotes.getQuoteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.delete('/quotes/:id',function (req, res, next) {
    var id = req.params.id;
    console.log("delete quote id: ",id);
    var result = quotes.deleteQuoteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});



router.post('/quoteCustomerInfo',function ( req, res, next){
    console.log("add quotecustomerinfo");
    var quoteCustomerInfo = req.body;

    var result = qutoCustomerInfoes.addQuoteCustomerInfo( quoteCustomerInfo );

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/quoteCustomerInfo', function(req, res, next){
    console.log("get all quotecustomerinfo");
    var result = QuoteCustomerInfoes.getAllQuotCustomerInfo();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });

});


module.exports = router;