/**
 * Created by youssef on 27/07/16.
 */
var express = require('express');
var IfController = require('./../../controllers/ifController');
var router = express.Router();
var ifController = new IfController();


router.get('/GetFullIf/:id', function (req, res, next) {
    var id = req.params.id;
    var result = ifController.getFullIf(id);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    var check = false;
    if (role === "super_admin")
        check = true;
    var result = ifController.getById(id, account._id, check);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if (role === "super_admin") {
        var result = ifController.getAll();
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        var result = ifController.getAll(account._id);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    }
});
router.post('/:param', function (req, res, next) {
    var params = req.params.param;
    var account = req.user[0];
    var role = account.role;
    var body = req.body;
    if (role === "super_admin") {
        var result = ifController.updateById(params, body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        if ("accountID" in body && body.accountID.toString() === account._id.toString()) {
            var result = ifController.updateById(params, body);
            result.then(function (response) {
                res.send(response);
            }, function (error) {
                res.send(error);
            });
        }
        else
            res.send({error: "permission denied"});
    }
});
router.post('/', function (req, res, next) {
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    if (role === "super_admin") {
        var result = ifController.add(body);
    } else {
        if (body.accountID.toString() === account._id.toString()) {
            var result = ifController.add(body);
        }
        else
            res.send({error: "permission denied"});
    }
    result.then(function (response) {
        console.log('Result: ', response);
        res.send(response);
    }, function (error) {
        console.log('Result error: ', error);
        res.send(error);
    });
});
router.delete('/:param', function (req, res, next) {
    var param = req.params.param;
    var account = req.user[0];
    var role = account.role;
    var check = false;
    if (role === "super_admin")
        check = true;
    var result = ifController.deleteById(param, account._id, check);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

module.exports = router;