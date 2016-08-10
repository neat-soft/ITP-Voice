/**
 * Created by Lucas on 30/11/15.
 */
var express = require('express');
var Devices = require('../../controllers/deviceController');
var router = express.Router();
var devices = Devices;

router.get('/getDeviceDyMac/:mac', function (req, res, next) {
    var mac = req.params.mac;
    console.log("Mac: ", mac);
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = devices.getDeviceDyMAC(mac, undefined, false);
    } else {
        var account = account._id;
        var result = devices.getDeviceDyMAC(mac, account, true);
    }
    result.then(function (response) {
        console.log("Device :",response);
        res.send(response);
    }, function (error) {
        console.log("Device not found from getInternalBySip! :",error);
        res.send(error);
    });
});router.get('/:id', function (req, res, next) {
    var device = req.params.id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = devices.getDeviceById(device, undefined, false);
    } else {
        var account = account._id;
        var result = devices.getDeviceById(device, account, true);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/add-device', function (req, res, next) {
    console.log("add devices");
    var account = req.user[0];
    var role = account.role;
    var device = req.body;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in device)
            var result = devices.addDevice(device);
        else
            res.send({error: "account ID is required"});
    } else {
        device.account = account._id;
        var result = devices.addDevice(device);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/authorize-device', function (req, res, next) {
    console.log("authorize");
    var device = req.body;
    console.log("body", device);
    var result = devices.authorizeDevice(device);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/external', function (req, res, next) {
    console.log("Get external route");
    var body = req.body;
    var result = devices.getExternalBySip(body);
    result.then(function (response) {
        console.log("Device :",response);
        res.send(response);
    }, function (error) {
        console.log("Device not found from getExternalBySip! :",error);
        res.send(error);
    });
});
router.post('/:id', function (req, res, next) {
    console.log("in update:");
    var device = req.body;
    var id = req.params.id;
    if(device._id)
        delete device._id;
    if(device.account)
        delete device.account;
    var account = req.user[0];
    var role = account.role;
    console.log("params: ", id, device, account, role);
    if(role === "super_admin") {
        var result = devices.updateById(id, device);
    } else {
        device.account = account._id;
        var result = devices.updateById(id, device);
    }
    result.then(function (response) {
        console.log("success", response);
        res.send(response);
    }, function (error) {
        console.log("error\n"+error);
        res.send(error);
    });
});
router.post('/', function (req, res, next) {
    console.log("nothing");
    var account = req.user[0];
    var role = account.role;
    var body = req.body;
    var child = body.child;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = devices.getAllDevices(child);
    } else {
        var account = account._id;
        var result = devices.getAllDevices(account);
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
        var result = devices.deleteById(id, undefined);
    } else {
        var result = devices.deleteById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/* Need to be tested */
router.get('/getInternalBySip/:sip', function (req, res, next) {
    var sip = req.params.sip;
    var result = devices.getInternalBySip(sip);
    result.then(function (response) {
        console.log("Device :",response);
        res.send(response);
    }, function (error) {
        console.log("Device not found from getInternalBySip! :",error);
        res.send(error);
    });
});
router.get('/getDeviceById/:id', function (req, res, next) {
    var deviceId = req.params.id;
    var result = devices.getDeviceById(deviceId);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getDeviceByInternal/:internal', function (req, res, next) {
    var deviceInternal = req.params.internal;
    var result = devices.getDeviceByInternal(deviceInternal);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/updateDeviceById', function (req, res, next) {
    var id = req.body.device.id;
    var result = devices.updateById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateDevice/:id', function (req, res, next) {
    var id = req.params.id;
    var body = req.body;
    var result = devices.updateDevice(id,body);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/deleteDeviceByName', function (req, res, next) {
    var devicename = req.body.device.devicename;
    console.log(devicename);

    var result = devices.deleteByDevicename(devicename);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/deleteDeviceById', function (req, res, next) {
    var id = req.body.device.id;
    console.log(id);

    var result = devices.deleteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;