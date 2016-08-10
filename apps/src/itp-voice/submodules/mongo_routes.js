/**
 * Created by Lucas on 27/11/15.
 */
var express = require('express');
var router = express.Router();
var MongoController = require ('./mongoController');
var mongoController = new MongoController();


router.get('/listAllUsers', function (req, res, next) {
    console.log(req.body);
    var result = mongoController.getAllUsers();
    result.then(function(response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/get-user', function (req, res, next) {
    var user = req.body.user;
    console.log(user);
    var result = mongoController.getUser(user);
    result.then(function(response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});



module.exports = router;