/**
 * Created by Lucas on 30/11/15.
 */
var express = require('express');
var router = express.Router();
var Ivrs = require('../../controllers/ivrController');
var ivrs = Ivrs;
var Numbers = require('../../controllers/numberController');
var numbers = new Numbers();

router.post('/add-ivr', function (req, res, next) {
    var ivr = req.body;
    console.log(ivr);
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in ivr)
            var result = ivrs.addIvr(ivr);
        else
            res.send({error: "account ID is required"});
    } else {
        ivr.account = account._id;
        var result = ivrs.addIvr(ivr);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/', function (req, res, next) {
    console.log("IVR: ");
    var account = req.user[0];
    console.log("IVR: ", account);
    var role = account.role;
    console.log("IVR: ", account, role);
    var child = req.body.child;
    console.log("IVR: ", account, role, child);
    if(role === "super_admin") {
        if (child)
            var result = ivrs.listIvrsByAccount(child);
        else
            var result = ivrs.getAllIvrs();
    } else {
        var accountID = account._id;
        console.log(accountID);
        result = ivrs.listIvrsByAccount(accountID);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/:id', function (req, res, next) {
    var ivr = req.body;
    var id = req.params.id;
    if(ivr._id)
        delete ivr._id;
    if(ivr.account)
        delete ivr.account;
    console.log("post ivr", ivr);
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = ivrs.updateById(id, ivr);
    } else {
        ivr.account = account._id;
        var result = ivrs.updateById(id, ivr);
    }
    result.then(function (response) {
        console.log("success", response);
        res.send(response);
    }, function (error) {
        console.log("error", error);
        res.send(error);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = ivrs.getIvrById(id, undefined);
    } else {
        var account = account._id;
        var result = ivrs.getIvrById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = ivrs.deleteById(id, undefined);
    } else {
        var result = ivrs.deleteById(id, account);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});

/*The following endpoints were not tested by abdel*/
router.post('/getIvr', function (req, res, next) {
    var ivr = req.body;
    console.log(ivr);
    var result = ivrs.getIvr(ivr);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getIvrByNumber/:number', function (req, res, next) {
    var number = req.params.number;
    var resultNumber = numbers.getNumber(number);
    resultNumber.then(function (NumberObject) {
        var result = ivrs.getIvrByNumber(NumberObject);
        result.then(function (response) {
            console.log(response);
            res.send(response);
        }, function (error) {
            console.log(error);
            res.send(error);
        });
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateIvrById/:id', function (req, res, next) {
    var ivr = req.body;
    if (ivr._id)delete ivr._id;
    var result = ivrs.updateById(req.params.id, ivr);
    result.then(function (response) {
        console.log("success\n" + response);
        res.send(response);
    }, function (error) {
        console.log("error\n" + error);
        res.send(error);
    });
});

router.post('/updateIvrByIvrname/:ivrname', function (req, res, next) {
    var ivr = req.body;
    if (ivr._id)delete ivr._id;
    console.log(ivr);
    var result = ivrs.updateByIvrname(req.params.ivrname, ivr);
    result.then(function (response) {
        console.log("success:\t" + response);
        res.send(response);
    }, function (error) {
        console.log("error:\t" + error);
        res.send(error);
    });
});

router.delete('/deleteIvrByName/:ivrname', function (req, res, next) {
    var ivrname = req.params.ivrname;
    console.log(ivrname);
    var result = ivrs.deleteByIvrname(ivrname);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


module.exports = router;