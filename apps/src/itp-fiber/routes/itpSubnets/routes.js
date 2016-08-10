/**
 * Created by Lucas on 12/07/17.
 */
var express = require('express');
var router = express.Router();

var ITPSubnets = require('../../controllers/itpSubnetController');
var itpSubnets = ITPSubnets;



// itpFiber/ipManagement/itpSubnets

router.post('/', function (req, res, next) {
    console.log("add/update ITP Subnets");
    var account = req.user[0];
    var role = account.role;
    var itpSubnet = req.body;
    console.log("body ", req.body);

    if ( "_id" in itpSubnet)
    {
        var subnetid = itpSubnet._id;
        delete itpSubnet._id;
        var result = itpSubnets.updateITPSubnet(subnetid, itpSubnet);
    }else
    {
        var result = itpSubnets.addITPSubnet(itpSubnet);
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
    
    var result = itpSubnets.getAllITPSubnets();

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
    
    var result = itpSubnets.getITPSubnetById(id);

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

    var result = itpSubnets.deleteITPSubnetById(id);

    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


module.exports = router;