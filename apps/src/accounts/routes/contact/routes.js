/**
 * Created by youssef on 15/07/16.
 */
var express = require('express');
var ContactController = require('../../../accounts/controllers/contactController');
var router = express.Router();
var contactController = new ContactController();

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    var check = false;
    if(role === "super_admin")
        check = true;
    var result = contactController.getContactById(id, account._id, check);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = contactController.getAllContact();
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        var result = contactController.getAllContact(account._id);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    }
});
router.post('/:param', function (req, res, next) {
    console.log("update contact");
    var params = req.params.param;
    var account = req.user[0];
    var role = account.role;
    var body = req.body;
    if(role === "super_admin") {
        var result = contactController.updateContact(params, body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    }else{
        if("accountID" in body && body.accountID.toString() === account._id.toString()) {
            var result = contactController.updateContact(params, body);
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
    console.log("Add contact");
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = contactController.addContact(body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        if(body.accountID.toString() === account._id.toString()) {
            var result = contactController.addContact(body);
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
router.delete('/:param', function (req, res, next) {
    var param = req.params.param;
    var account = req.user[0];
    var role = account.role;
    var check = false;
    if(role === "super_admin")
        check = true;
    var result = contactController.deleteContact(param, account._id, check);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

module.exports = router;