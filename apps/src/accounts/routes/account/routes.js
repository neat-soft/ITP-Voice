/**
 * Created by Lucas on 30/11/15.
 */

var express = require('express');
var Accounts = require('../../../accounts/controllers/accountController');
var router = express.Router();
var accounts = new Accounts();

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    console.log(id, account);
    var result = accounts.getAccountById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = accounts.getAllAccounts();
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        var result = accounts.getAllAccounts(account._id);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    }
});
router.post('/:param', function (req, res, next) {
    var params = req.params.param;
    var body = req.body;
    var result = accounts.updateAccount(params, body);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = accounts.addAccount(req.body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        res.send({error: "permission denied"});
    }
});
router.delete('/:param', function (req, res, next) {
    var param = req.params.param;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = accounts.deleteAccount(param);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    }else{
        res.send({error: "permission denied"});
    }
});

module.exports = router;