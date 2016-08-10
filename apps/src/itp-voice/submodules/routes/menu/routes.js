/**
 * Created by Lucas on 30/11/15.
 */
var express = require('express');
var router = express.Router();
var Menus = require('../../controllers/menuController');
var menus = new Menus();
var Numbers = require('../../controllers/numberController');
var numbers = new Numbers();

router.post('/add-menu', function (req, res, next) {
    var menu = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in menu)
            var result = menus.addMenu(menu);
        else
            res.send({error: "account ID is required"});
    } else {
        menu.account = account._id;
        var result = menus.addMenu(menu);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var account = req.user[0];
    var role = account.role;
    var body = req.body;
    var child = body.child;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if (child)
            var result = menus.listMenusByAccount(child);
        else
            var result = menus.getAllMenus();
    } else {
        var account = account._id;
        var result = menus.listMenusByAccount(account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
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
        var result = menus.getMenuById(id, undefined);
    } else {
        var account = account._id;
        var result = menus.getMenuById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/:id', function (req, res, next) {
    var menu = req.body;
    var id = req.params.id;
    if(menu._id)
        delete menu._id;
    if(menu.account)
        delete menu.account;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = menus.updateById(id, menu);
    } else {
        menu.account = account._id;
        var result = menus.updateById(id, menu);
    }
    result.then(function (response) {
        console.log("success", response);
        res.send(response);
    }, function (error) {
        console.log("error", error);
        res.send(error);
    });
});
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = menus.deleteById(id, undefined);
    } else {
        var result = menus.deleteById(id, account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

/*The following endpoints were not tested by abdel*/

router.post('/getMenu', function (req, res, next) {
    var menu = req.body.menu;
    console.log(menu);
    var result = menus.getMenu(menu);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;