/**
 * Created by Lucas on 10/12/15.
 */
var express = require('express');
var router = express.Router();
var FeatureCodes = require('../../controllers/featureCodeController');
var featureCodes = new FeatureCodes();

router.post('/add-feature-code', function (req, res, next) {
    var featureCode = req.body;
    console.log("addFeatureCode: ", featureCode);
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in featureCode)
            var result = featureCodes.addFeatureCode(featureCode);
        else
            res.send({error: "account ID is required"});
    } else {
        featureCode.account = account._id;
        var result = featureCodes.addFeatureCode(featureCode);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/getFeatureCode', function (req, res, next) {
    var featureCode = req.body;
    var result = featureCodes.getFeatureCode(featureCode);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/* Need to be tested */
router.get('/listAllFeatureCodes', function (req, res, next) {
    var result = featureCodes.getAllFeatureCodes();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getFeatureCode/:featureCode', function (req, res, next) {
    var featureCode = req.params.featureCode;
    console.log("******************featureCode: ",featureCode);
    var result = featureCodes.getFeatureCode(featureCode);
    result.then(function (response) {
        console.log("***********response",response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getFeatureCodeById/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = featureCodes.getFeatureCodeById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getFeatureCodeByExtension/:extension', function (req, res, next) {
    console.log(req.params.extension);
    var extension = req.params.extension;
    var resultExtension = featureCodes.getFeatureCodeByExtension(extension);
    resultExtension.then(function (featureCode) {
        console.log("FeatureCode :", featureCode);
        res.send(featureCode);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateFeatureCodeById/:id', function (req, res, next) {
    var featureCode = req.body.featureCode;
    if (featureCode._id)delete featureCode._id;
    var result = featureCodes.updateById(req.params.id, featureCode);
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
    var result = featureCodes.addUserToQ(id, user);
    result.then(function (response) {
        console.log("success update featureCode add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update featureCode add user:  ", error);
        res.send(error);
    });
});

router.post('/updateQ/:id', function (req, res, next) {
    var body = req.body;
    console.log("**updateQ: ",body);
    var id = req.params.id;
    var result = featureCodes.updateQ(id, body);
    result.then(function (response) {
        console.log("success update featureCode add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update featureCode add user:  ", error);
        res.send(error);
    });
});

router.delete('/deleteFeatureCodeByName/:featureCodename', function (req, res, next) {
    var featureCodename = req.params.featureCodename;
    console.log(featureCodename);

    var result = featureCodes.deleteByFeatureCodename(featureCodename);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteFeatureCodeById/:id', function (req, res, next) {
    var result = featureCodes.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;