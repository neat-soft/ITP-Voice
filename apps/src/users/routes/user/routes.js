/**
 * Created by Lucas on 30/11/15.
 */

var express = require('express');
var formidable = require('formidable');
var fs = require('fs');
var router = express.Router();
var Users = require('../../../users/controllers/userController');
var users = new Users();
var Devices = require('../../../itp-voice/submodules/controllers/deviceController');
var devices = Devices;
var MailBoxes = require('../../../itp-voice/submodules/controllers/mailBoxController');
var mailBoxes = new MailBoxes();

router.get('/', function (req, res, next) {
    console.log("Req: ",req);
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = users.getAllUsers();
    } else {
        var accountID = account._id;
        console.log(accountID);
        result = users.listUsersByAccount(accountID);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/add-user', function (req, res, next) {
    var user = req.body;
    var account = req.user[0];
    var role = account.role;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields, files);
        var name = files.profilePicture.name;
        var path = files.profilePicture.path;
        fs.readFile(path, "base64", function(err , buffer){
            fields.profilePicture = buffer;
            if(role === "super_admin") {
                if ("account" in fields)
                    var result = users.addUser(fields);
                else
                    res.send({error: "account ID is required"});
            } else {
                fields.account = account._id;
                var result = users.addUser(fields);
            }
            result.then(function (response) {
                res.send(response);
            }, function (error) {
                res.send(error);
            });
        });
    });
    /*if(role === "super_admin") {
     if ("account" in user)
     var result = users.addUser(user);
     else
     res.send({error: "account ID is required"});
     } else {
     user.account = account._id;
     var result = users.addUser(user);
     }
     result.then(function (response) {
     console.log(response);
     res.send(response);
     }, function (error) {
     console.log(error);
     res.send(error);
     });*/
});
router.post('/:id', function (req, res, next) {
    var user = req.body;
    var id = req.params.id;
    if(user._id)
        delete user._id;
    if(user.account)
        delete user.account;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = users.updateById(id, user);
    } else {
        user.account = account._id;
        var result = users.updateById(id, user);
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
        var result = users.getUserById(id, undefined);
    } else {
        var account = account._id;
        var result = users.getUserById(id, account);
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
        var result = users.deleteById(id, undefined);
    } else {
        var result = users.deleteById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getUserByDevice/:idDevice', function (req, res, next) {
    var idDevice = req.params.idDevice;
    console.log("type of idDevice", typeof idDevice);
    var result = users.getUserByDevice(idDevice);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

/*Not Used */
router.post('/updateUserById/:id', function (req, res, next) {
    var user = req.body;
    if(user._id)delete user._id;
    var result = users.updateById(req.params.id,user);
    result.then(function (response) {
        console.log("success\n"+response);
        res.send(response);
    }, function (error) {
        console.log("error\n"+error);
        res.send(error);
    });
});
router.post('/updateUserByUsername/:username', function (req, res, next) {
    var user = req.body;
    if(user._id)delete user._id;
    console.log(user);
    var result = users.updateByUsername(req.params.username,user);
    result.then(function (response) {
        console.log("success:\t"+response);
        res.send(response);
    }, function (error) {
        console.log("error:\t"+error);
        res.send(error);
    });
});
router.delete('/deleteUserByName/:username', function (req, res, next) {
    var username = req.params.username;
    var result = users.deleteByUsername(username);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteUserById/:id', function (req, res, next) {
    var result = users.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/listAllUsers/account/:accountID', function (req, res, next) {
    var accountID = req.params.accountID;
    result = users.listUsersByAccount(accountID);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/getUser', function (req, res, next) {
    var user = req.body.user;
    console.log(user);
    var result = users.getUser(user);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;