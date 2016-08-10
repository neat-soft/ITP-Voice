/**
 * Created by Lucas on 30/11/15.
 */

var express = require('express');
var router = express.Router();
var RingGroups = require('../../controllers/ringGroupController');
var ringGroups = new RingGroups();
/*var Numbers = require('../../controllers/numberController');
var numbers = new Numbers();*/


router.post('/add-ring-group', function (req, res, next) {
    var ringGroup = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in ringGroup)
            var result = ringGroups.addRingGroup(ringGroup);
        else
            res.send({error: "account ID is required"});
    } else {
        ringGroup.account = account._id;
        var result = ringGroups.addRingGroup(ringGroup);
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
    var rg = req.body;
    var id = req.params.id;
    if(rg._id)
        delete rg._id;
    if(rg.account)
        delete rg.account;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = ringGroups.updateById(id, rg);
    } else {
        rg.account = account._id;
        var result = ringGroups.updateById(id, rg);
    }
    result.then(function (response) {
        console.log("success", response);
        res.send(response);
    }, function (error) {
        console.log("error\n"+error);
        res.send(error);
    });
});
router.post('/', function (req, res, next) {
    console.log(req.body);
    var account = req.user[0];
    var role = account.role;
    var child = req.body.child;
    if(role === "super_admin") {
        if (child)
            var result = ringGroups.listRingGroupsByAccount(child);
        else
            var result = ringGroups.getAllRingGroups();
    } else {
        var accountID = account._id;
        console.log(accountID);
        result = ringGroups.listRingGroupsByAccount(accountID);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = ringGroups.getRingGroupById(id, undefined);
    } else {
        var account = account._id;
        var result = ringGroups.getRingGroupById(id, account);
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
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = ringGroups.deleteById(id, undefined);
    } else {
        var result = ringGroups.deleteById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


/*The following endpoints were not tested by abdel*/
/*not Used*/
router.post('/getRingGroup', function (req, res, next) {
    var ringGroup = req.body.ringGroup;
    console.log(ringGroup);
    var result = ringGroups.getRingGroup(ringGroup);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getRingGroupbyid/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = ringGroups.getRingGroupById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateRingGroupById/:id', function (req, res, next) {
    var ringGroup = req.body.ringGroup;
    if (ringGroup._id)delete ringGroup._id;
    var result = ringGroups.updateById(req.params.id, ringGroup);
    result.then(function (response) {
        console.log("success\n" + response);
        res.send(response);
    }, function (error) {
        console.log("error\n" + error);
        res.send(error);
    });
});
router.post('/updateRingGroupByRingGroupname/:ringGroupname', function (req, res, next) {
    var ringGroup = req.body.ringGroup;
    if (ringGroup._id)delete ringGroup._id;
    console.log(ringGroup);
    var result = ringGroups.updateByRingGroupname(req.params.ringGroupname, ringGroup);
    result.then(function (response) {
        console.log("success:\t" + response);
        res.send(response);
    }, function (error) {
        console.log("error:\t" + error);
        res.send(error);
    });
});
router.delete('/deleteRingGroupByName/:ringGroupname', function (req, res, next) {
    var ringGroupname = req.params.ringGroupname;
    console.log(ringGroupname);

    var result = ringGroups.deleteByRingGroupname(ringGroupname);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteRingGroupById/:id', function (req, res, next) {
    var result = ringGroups.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;