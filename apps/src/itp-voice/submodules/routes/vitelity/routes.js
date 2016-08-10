/**
 * Created by Lucas on 30/11/15.
 */

var express = require('express');
var Vitelity = require('../../controllers/vitelityController');

var router = express.Router();
var vitelity = new Vitelity();

router.post('/bynpa', function (req, res, next) {
    console.log("bynpa");
    //var body = {npa: 305};
    var body = req.body;
    var result = vitelity.searchByNPA(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/bynpanxx', function (req, res, next) {
    console.log("bynpanxx");
    //var body = {npanxx: 305767};
    var body = req.body;
    var result = vitelity.searchByNPANXX(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/gettollfree', function (req, res, next) {
    console.log("gettollfree");
    var result = vitelity.getTollFree();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/search-toll-free', function (req, res, next) {
    console.log("searchtollfree");
    //var body = {did: 866};
    var body = req.body;
    var result = vitelity.searchTollFree(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/order-local-number', function (req, res, next) {
    console.log("order-local-number");
    //body = {did: 3057674109}
    var body = req.body;
    var result = vitelity.orderLocalNumber(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/order-toll-free', function (req, res, next) {
    console.log("order-toll-free");
    //body = {did: 8442957680}
    var body = req.body;
    var result = vitelity.orderTollFreeNumber(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/remove', function (req, res, next) {
    console.log("searchtollfree");
    //body = {did: 8442957680}
    var body = req.body;
    var result = vitelity.removeNumber(body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;
