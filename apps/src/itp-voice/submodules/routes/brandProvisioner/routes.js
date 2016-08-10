/**
 * Created by root on 12/05/16.
 */
var express = require('express');
var router = express.Router();
/*var BrandProvisioners = require('../../controllers/provisioner/brandProvisionerController');
var brandProvisioners = new BrandProvisioners();

//add brand provisioner
router.post('/add-brand-provisioner', function (req, res, next) {
    var brandProvisioner = req.body;
    console.log("Body: ", brandProvisioner);
    var result = brandProvisioners.addBrandProvisioner(brandProvisioner);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
//get all brand provisioner
router.get('/:brand/:family/:model', function (req, res, next) {
    var brand = req.params.brand,
        family = req.params.family,
        model = req.params.model;
    console.log("Brand: ", brand, model, family);
    var result = brandProvisioners.getBrandProvisioner(brand, family, model);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
//get brand provisionner by id
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var result = brandProvisioners.getBrandProvisionerById(id)
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
//get all brand provisioner
router.get('/', function (req, res, next) {
    var result = brandProvisioners.getAllBrandProvisioner();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

//update brand provisioner
router.post('/:id', function (req, res, next) {
    var id = req.params.id;
    var brandProvisioner = req.body;
    var result = brandProvisioners.updateById(id, brandProvisioner);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
//delete brand provisioner
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var result = brandProvisioners.deleteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});*/

module.exports = router;