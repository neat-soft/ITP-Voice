/**
 * Created by Lucas on 30/11/15.
 */
var express = require('express');
var router = express.Router();
var Login = require('./loginController');
login = new Login();

router.post('/login', function (req, res, next) {
    console.log(req.body);
    var data = req.body;
    login.check(data)
        .then(function (token) {
            res.json(token);
        }, function (status) {
            res.send(status);
        });
});