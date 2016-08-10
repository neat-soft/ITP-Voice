/**
 * Created by Lucas on 10/12/15.
 */
var express = require('express');
var router = express.Router();
var Mohs = require('../../controllers/mohController');
var mohs = new Mohs();
var formidable = require('formidable');

router.post('/add-moh', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if(role === "super_admin") {
            if ("account" in fields)
                var result = mohs.addMoh(fields, files);
            else
                res.send({error: "account ID is required"});
        } else {
            fields.account = account._id;
            var result = mohs.addMoh(fields, files);
        }
        result.then(function (response) {
            res.send(response);
        }, function (error) {
            res.send(error);
        });
    });
});

router.get('/listAllMohs', function (req, res, next) {
    console.log(req.body);
    var result = mohs.getAllMohs();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

/* Need to be tested */
router.post('/getMoh', function (req, res, next) {
    var moh = req.body.moh;
    console.log(moh);
    var result = mohs.getMoh(moh);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getMohByExtension/:extension', function (req, res, next) {
    console.log(req.params.extension);
    var extension = req.params.extension;
    var resultExtension = mohs.getMohByExtension(extension);
    resultExtension.then(function (moh) {
        console.log("Moh :", moh);
        res.send(moh);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = mohs.getMohById(id);
    result.then(function (readstream) {
        //console.log(response);
        readstream.pipe(res);
        //res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/updateMohById/:id', function (req, res, next) {
    var moh = req.body.moh;
    if (moh._id)delete moh._id;
    var result = mohs.updateById(req.params.id, moh);
    result.then(function (response) {
        console.log("success\n" + response);
        res.send(response);
    }, function (error) {
        console.log("error\n" + error);
        res.send(error);
    });
});

router.post('/addUserToQ/:id', function (req, res, next) {
    console.log("=========================>:",req);
    var user = req.body.user;
    var id = req.params.id;

    if (moh._id)delete moh._id;
    var result = mohs.addUserToQ(id, user);
    result.then(function (response) {
        console.log("success update moh add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update moh add user:  ", error);
        res.send(error);
    });
});

router.post('/updateQ/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;
    if (moh._id)delete moh._id
    var result = mohs.updateQ(id, body);
    result.then(function (response) {
        console.log("success update moh add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update moh add user:  ", error);
        res.send(error);
    });
});

router.delete('/deleteMohByName/:mohname', function (req, res, next) {
    var mohname = req.params.mohname;
    console.log(mohname);

    var result = mohs.deleteByMohname(mohname);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteMohById/:id', function (req, res, next) {
    var result = mohs.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;