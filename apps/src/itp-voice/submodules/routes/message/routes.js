/**
 * Created by Lucas on 10/12/15.
 */
var express = require('express');
var router = express.Router();
var Messages = require('../../controllers/messageController');
var messages = new Messages();
var Numbers = require('../../controllers/numberController');
var numbers = new Numbers();


router.get('/listAllMessages', function (req, res, next) {
    console.log(req.body);
    var result = messages.getAllMessages();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/getMessage', function (req, res, next) {
    var message = req.body.message;
    console.log(message);
    var result = messages.getMessage(message);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMessageById/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = messages.getMessageById(id);
    result.then(function (readstream) {
        //console.log(response);
        readstream.pipe(res);
        //res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/addRecording', function (req, res, next) {
    console.log("In add Recording route");
    var path = req.body.path;
    console.log("Path ", path);
    var result = messages.addRecording(path);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

router.post('/addMessage', function (req, res, next) {
    console.log("In add Message route");
    var message = req.body.message;
    console.log("message ", message);
    var result = messages.addMessage(message);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

router.post('/updateMessageById/:id', function (req, res, next) {
    var message = req.body.message;
    if (message._id)delete message._id;
    var result = messages.updateById(req.params.id, message);
    result.then(function (response) {
        console.log("success\n" + response);
        res.send(response);
    }, function (error) {
        console.log("error\n" + error);
        res.send(error);
    });
});

router.delete('/deleteMessageById/:id', function (req, res, next) {
    var result = messages.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;