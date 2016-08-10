/**
 * Created by Lucas on 18/01/16.
 */
var express = require('express');
var CallLogs = require('../../controllers/callLogController');
var router = express.Router();
var callLogs = new CallLogs();

router.post('/updateOrAddCallLog/:from/:to', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    var from = req.params.from,
        to = req.params.to;
    var callLog = req.body;
    console.log("Body calllog: ", req.body, from, to);
    if(role === "super_admin") {
        if ("account" in callLog) {
            var model = {
                from_id: from,
                to_id: to,
                account: req.body.account
            };
            var result = callLogs.updateOrAddCallLog(model, callLog);
        }
        else
            res.send({error: "account ID is required"});
    } else {
        var model = {
            from_id:from,
            to_id:to,
            account: account._id
        };
        var result = callLogs.updateOrAddCallLog(model,callLog);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/getCallLogByFromTo/:from/:to', function (req, res, next) {
    var from = req.params.from,
        to = req.params.to;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = callLogs.getCallLogByFromTo(from, to, undefined, false);
    } else {
        var account = account._id;
        var result = callLogs.getCallLogByFromTo(from, to, account, true);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getCallLogByFrom/:from', function (req, res, next) {
    var from = req.params.from;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = callLogs.getCallLogByFrom(from, undefined, false);
    } else {
        var result = callLogs.getCallLogByFrom(from, account._id, true);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/*need to be tested */
router.get('/listAllCallLogs', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = callLogs.getAllCallLogs();
    } else {
        var account = account._id;
        var result = callLogs.getAllCallLogs(account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getCallLogById/:id', function (req, res, next) {
    var callLogId = req.params.id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = callLogs.getCallLogById(callLogId, undefined, false);
    } else {
        var account = account._id;
        var result = callLogs.getCallLogById(callLogId, account, true);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getCallLogByNumber/:number', function (req, res, next) {
    var number = req.params.number;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = callLogs.getCallLogByNumber(number, undefined, false);
    } else {
        var account = account._id;
        var result = callLogs.getCallLogByNumber(number, account, true);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/addCallLog', function (req, res, next) {
    var callLog = req.body.callLog;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in callLog)
            var result = callLogs.addCallLog(callLog);
        else
            res.send({error: "account ID is required"});
    } else {
        callLog.account = account._id;
        var result = callLogs.addCallLog(callLog);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/updateCallLog/:id', function (req, res, next) {
    var callLog = req.body;
    var id = req.params.id;
    if(callLog._id)
        delete callLog._id;
    if(callLog.account)
        delete callLog.account;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = callLogs.updateCallLog(id,callLog);
    } else {
        callLog.account = account._id;
        var result = callLogs.updateCallLog(id,callLog);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/* need account */
router.post('/deleteCallLogByName', function (req, res, next) {
    var callLogname = req.body.callLog.callLogname;
    console.log(callLogname);
    var result = callLogs.deleteByCallLogname(callLogname);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/deleteCallLogById', function (req, res, next) {
    var id = req.body.callLog.id;
    console.log(id);

    var result = callLogs.deleteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;