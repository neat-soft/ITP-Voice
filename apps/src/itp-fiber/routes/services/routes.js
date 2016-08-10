/**
 * Created by Lucas on 12/07/17.
 */
var express = require('express');
var router = express.Router();
var FiberServices = require('../../controllers/fiberServiceController');
var fiberServices = FiberServices;

/// itpFiber/services
router.post('/', function (req, res, next) {
    console.log("add/update fiberservice");
    var account = req.user[0];
    var role = account.role;
    var fiberService = req.body;
    console.log("body ", req.body);
    if ( "_id" in fiberService)
    {
        var serviceID = fiberService._id;
        delete fiberService._id;
        var result = fiberServices.updateById(serviceID, fiberService);
    }else
    {
        if(role === "super_admin") {
            if ("accountid" in fiberService)
                var result = fiberServices.addService(fiberService);
            else
            {
                console.log("fiberdevice : ",fiberDevice);
                res.send({error: "account ID is required"});
            }
        } else {
            fiberService.accountid = account._id;
            var result = fiberServices.addService(fiberService);
        }
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
    
    if ( role === "super_admin")
    {
        var result = fiberServices.getAllService(undefined);
    }else{
        var accountid = account._id;
        var result = fiberServices.getAllService(accountid);
    }
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

    var fiberServiceId = req.params.id;
    var result = fiberServices.getServiceById(fiberServiceId);

    result.then(function (response){
        console.log("sucess: ",response);
        res.send(response);
    },function (error){
        console.log("error: ",error);
        res.send(error);
    });
});
router.delete('/:id',function(req, res, next){
    var account = req.user[0];
    var role = account.role;

    var fiberServiceId = req.params.id;
    if ( role === "super_admin")
    {
        var result = fiberServices.deleteById(fiberServiceId, undefined);        
    }else{
        var accountid = account._id;
        var result = fiberServices.deleteById(fiberServiceId,accountid);
    }
    result.then(function (response){
        console.log( response);
        res.send(response);
    },function (error){
        console.log(error);
        res.send(error);
    });
});


module.exports = router;