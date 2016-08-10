/**
 * Created by youssef on 15/07/16.
 */
var express = require('express');
var BillController = require('../../controllers/billSettingsController');
var router = express.Router();
var billController = new BillController();

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    var check = false;
    if (role === "super_admin")
        check = true;
    var result = billController.getBillSettingById(id, account._id, check);
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
        var result = billController.getAllBillSetting();
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        var result = billController.getAllBillSetting(account._id);
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
        var result = billController.updateBillSetting(params, body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        if ("account" in body && body.account.toString() === account._id.toString()) {
            var result = billController.updateBillSetting(params, body);
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
        var result = billController.addBillSetting(body);
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    } else {
        if (body.account.toString() === account._id.toString()) {
            var result = billController.addBillSetting(body);
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
    if (role === "super_admin")
        check = true;
    var result = billController.deleteBillSetting(param, account._id, check);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

module.exports = router;