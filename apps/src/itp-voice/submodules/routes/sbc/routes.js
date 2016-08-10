/**
 * Created by root on 10/05/16.
 */
var express = require('express');
var SBCs = require('../../controllers/sbcController');
var sbcs = new SBCs();
var router = express.Router();

router.post('/add-sbc', function (req, res, next) {
    var sbc = req.body;
    var result = sbcs.addSbc(sbc);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/random', function (req, res, next) {
    var result = sbcs.getRandomSbc();
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var result = sbcs.getSbcById(id);
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/:id', function (req, res, next) {
    var body = req.body;
    var id = req.params.id;
    var result = sbcs.updateSbcById(id,body);
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
    var result = sbcs.deleteSbcById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/', function (req, res, next) {
    var result = sbcs.getAllSbcs();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});



module.exports = router;