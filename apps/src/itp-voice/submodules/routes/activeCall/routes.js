/**
 * Created by Lucas on 18/01/16.
 */
var express = require('express');
var ActiveCalls = require('../../controllers/activeCallController');
var router = express.Router();
var activeCalls = new ActiveCalls();


router.post('/', function (req, res, next) {
    var json = req.body;
    console.log("Route get Active call:", json);
    var result = activeCalls.getActiveCallById(json);
    result.then(function (response) {
        console.log("Active Call :",response);
        res.send(response);
    }, function (error) {
        console.log("Active Call Error:",error);
        res.send(error);
    });
});
router.post('/updateActiveCall/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;
    var result = activeCalls.updateActiveCall(id,body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/*should be tested*/
router.get('/listAllActiveCalls', function (req, res, next) {
    var result = activeCalls.getAllActiveCalls();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getActiveCallByFromTo/:from/:to', function (req, res, next) {
    var from = req.params.from,
        to = req.params.to;
    var result = activeCalls.getActiveCallByFromTo(from,to);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getActiveCallByNumber/:number', function (req, res, next) {
    var number = req.params.number;
    var result = activeCalls.getActiveCallByNumber(number);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/updateOrAddActiveCall/:from/:to', function (req, res, next) {
   var from = req.params.from,
       to = req.params.to;
    var model = {
        from_id:from,
        to_id:to
    };
    var body = req.body;
    var result = activeCalls.updateOrAddActiveCall(model,body);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/addActiveCall', function (req, res, next) {
    var activeCall = req.body;
    console.log(activeCall);
    var result = activeCalls.addActiveCall(activeCall);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.delete('/deleteActiveCall/:from/:to', function (req, res, next) {
    var from = req.params.from,
        to = req.params.to;
    var result = activeCalls.deleteActiveCall(from, to);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


module.exports = router;