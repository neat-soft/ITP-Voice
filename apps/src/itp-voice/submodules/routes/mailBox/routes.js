/**
 * Created by Lucas on 30/11/15.
 */

var express = require('express');
var router = express.Router();
var Devices = require('../../controllers/deviceController');
var devices = Devices;
var MailBoxes = require('../../controllers/mailBoxController');
var mailBoxs = new MailBoxes();

/*router.post('/addMailBox', function (req, res, next) {
    var mailBox = req.body.mailBox;
    var result = mailBoxs.addMailBox(mailBox);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/listAllMailBoxs', function (req, res, next) {
    console.log(req.body);
    var result = mailBoxs.getAllMailBoxs();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getMailBox', function (req, res, next) {
    var mailBox = req.body.mailBox;
    console.log(mailBox);
    var result = mailBoxs.getMailBox(mailBox);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMailBoxBySip/:sip', function (req, res, next) {
    var sip = req.params.sip;
    console.log("inside getMailboxBysip", sip);
    var result = mailBoxs.getMailBoxBySip(sip);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMailBoxByNumber/:number', function (req, res, next) {
    var number = req.params.number;
    console.log("inside getMailboxBysip", number);
    var result = mailBoxs.getMailBoxByNumber(number);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getMailBoxById/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = mailBoxs.getMailBoxById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMailBoxByDevice/:idDevice', function (req, res, next) {
    var idDevice = req.params.idDevice;
    console.log("type of idDevice", typeof idDevice);
    var result = mailBoxs.getMailBoxByDevice(idDevice);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateMailBoxById/:id', function (req, res, next) {
    var mailBox = req.body.mailBox;
    if(mailBox._id)delete mailBox._id;
    var result = mailBoxs.updateById(req.params.id,mailBox);
    result.then(function (response) {
        console.log("success\n"+response);
        res.send(response);
    }, function (error) {
        console.log("error\n"+error);
        res.send(error);
    });
});

router.delete('/deleteMailBoxByName/:mailBoxname', function (req, res, next) {
    var mailBoxname = req.params.mailBoxname;
    var result = mailBoxs.deleteByMailBoxname(mailBoxname);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteMailBoxById/:id', function (req, res, next) {
    var result = mailBoxs.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});*/

router.get('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = mailBoxs.getAllMailBoxs();
    } else {
        var accountID = account._id;
        console.log(accountID);
        result = mailBoxs.listMailBoxsByAccount(accountID);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/add-mail-box', function (req, res, next) {
    var mailBox = req.body;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in mailBox)
            var result = mailBoxs.addMailBox(mailBox);
        else
            res.send({error: "account ID is required"});
    } else {
        mailBox.account = account._id;
        var result = mailBoxs.addMailBox(mailBox);
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
    var mailBox = req.body;
    var id = req.params.id;
    console.log("Body", mailBox);
    if(mailBox._id)
        delete mailBox._id;
    if(mailBox.account)
        delete mailBox.account;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = mailBoxs.updateById(id, mailBox);
    } else {
        user.account = account._id;
        var result = mailBoxs.updateById(id, mailBox);
    }
    result.then(function (response) {
        console.log("success", response);
        res.send(response);
    }, function (error) {
        console.log("error\n"+error);
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
        var result = mailBoxs.getMailBoxById(id, undefined);
    } else {
        var account = account._id;
        var result = mailBoxs.getMailBoxById(id, account);
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
        var result = mailBoxs.deleteById(id, undefined);
    } else {
        var result = mailBoxs.deleteById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMailBoxBySip/:sip', function (req, res, next) {
    var sip = req.params.sip;
    console.log("inside getMailboxBysip", sip);
    var result = mailBoxs.getMailBoxBySip(sip);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;