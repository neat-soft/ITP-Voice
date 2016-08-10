/**
 * Created by Lucas on 12/07/17.
 */
var express = require('express');
var router = express.Router();
var FiberDevices = require('../../controllers/fiberDeviceController');
var fiberDevices = FiberDevices;



/// itpFiber/devices

router.post('/', function (req, res, next) {
    console.log("add/update fiberDevice");
    var account = req.user[0];
    var role = account.role;
    var fiberDevice = req.body;
    console.log("body ", req.body);

    if ("_id" in fiberDevice )
    {
        console.log("update fiberDevice");
        var fiberid = fiberDevice._id; 
        delete fiberDevice._id;
        var result = fiberDevices.updateById(fiberid,fiberDevice);
    }else{
        console.log("adds fiberDevice");
        if(role === "super_admin") {
            if ("accountid" in fiberDevice)
            {
                var result = fiberDevices.addDevice(fiberDevice);
            }
            else
            {
                console.log("fiberdevice : ",fiberDevice);
                res.send({error: "account ID is required"});
            }
        } else {
            fiberDevice.accountid = account._id;
            var result = fiberDevices.addDevice(fiberDevice);
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

router.delete('/:id',function (req , res, next){
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    console.log("body ",req.body);
    
    if ( role === "super_admin")
    {
        var result = fiberDevices.deleteById( id, undefined);
    }else{
        var result = fiberDevices.deleteById( id, account );
    }
    result.then(function (response){
        console.log( response);
        res.send(response);
    },function (error){
        console.log(error);
        res.send(error);
    });
});

router.get('/:id', function (req, res, next){
    var fiberDeviceId = req.params.id;
    var result = fiberDevices.getDeviceById(fiberDeviceId);
    result.then(function (response){
        console.log("sucess: ",response);
        res.send(response);
    },function (error){
        console.log("error: ",error);
        res.send(error);
    });
});

router.get('/',function (req, res, next) {
    var account = req.user[0];
    var role = account.role;

    if ( role === "super_admin"){
        var result = fiberDevices.getAllDevices(undefined);
    }else {
        var accountid = account.id;
        var result = fiberDevices.getAllDevices(accountid);
    }
    result.then(function (response){
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});



module.exports = router;