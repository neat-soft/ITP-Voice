/**
 * Created by Lucas on 12/07/17.
 */
var express = require('express');
var router = express.Router();
var CustomerSubnets = require('../../controllers/customerSubnetController');
var customerSubnets = CustomerSubnets;


// itpFiber/ipManagement/customerSubnets

router.post('/', function (req, res, next) {
    console.log("add/update ITP Subnets");
    var account = req.user[0];
    var role = account.role;
    var customerSubnet = req.body;
    console.log("body ", req.body);

    if ( "_id" in customerSubnet)
    {
        var subnetid = customerSubnet._id;
        delete customerSubnet._id;
        var result = customerSubnets.updateCustomerSubnet(subnetid, customerSubnet);
    }else
    {
        var result = customerSubnets.addCustomerSubnet(customerSubnet);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/',function(req, res, next){
    var account = req.user[0];
    var role = account.role;
    
    var result = customerSubnets.getAllCustomerSubnets();

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/:id',function(req, res, next){
    var account = req.user[0];
    var role = account.role;
    var id = req.params.id;
    
    var result = customerSubnets.getCustomerSubnetById(id);

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.delete('/:id',function ( req, res, next){
    var account = req.user[0];
    var role = account.role;
    var id = req.params.id;

    var result = customerSubnets.deleteCustomerSubnetById(id);

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


module.exports = router;