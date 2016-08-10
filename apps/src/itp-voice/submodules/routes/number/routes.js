/**
 * Created by Lucas on 30/11/15.
 */
var express = require('express');
var router = express.Router();
var Numbers = require('../../controllers/numberController');

var numbers = new Numbers();

router.post('/local-number', function (req, res, next) {
    console.log(req.body);
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in body)
            var result = numbers.addLocalNumber(body);
        else
            res.send({error: "account ID is required"});
    } else {
        body.account = account._id;
        var result = numbers.addLocalNumber(body);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/toll-free', function (req, res, next) {
    console.log(req.body);
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in body)
            var result = numbers.addTollFree(body);
        else
            res.send({error: "account ID is required"});
    } else {
        body.account = account._id;
        var result = numbers.addTollFree(body);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.delete('/', function (req, res, next) {
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        var result = numbers.deleteNumber(body, false);
    } else {
        body.account = account._id;
        var result = numbers.deleteNumber(body, true);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

/*router.post('/list-numbers', function (req, res, next) {
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in body)
            var result = numbers.getAllNumbers(body);
        else
            res.send({error: "account ID is required"});
    } else {
        body.account = account._id;
        var result = numbers.getAllNumbers(body);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});*/

router.post('/link-number', function (req, res, next) {
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in body)
            var result = numbers.linkNumber(body);
        else
            res.send({error: "account ID is required"});
    } else {
        body.account = account._id;
        var result = numbers.linkNumber(body);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/unlink-number', function (req, res, next) {
    var body = req.body;
    var account = req.user[0];
    var role = account.role;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if ("account" in body)
            var result = numbers.unlinkNumber(body, false);
        else
            res.send({error: "account ID is required"});
    } else {
        body.account = account._id;
        var result = numbers.unlinkNumber(body, true);
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
    var account = req.user[0];
    var role = account.role;
    var body = req.body;
    var child = body.child;
    console.log("body ", req.body);
    if(role === "super_admin") {
        if (child)
            var result = numbers.listNumbersByAccount(child);
        else
            var result = numbers.getAllNumbers();
    } else {
        var account = account._id;
        var result = numbers.listNumbersByAccount(account);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
/*------ The following endpoints need update ------*/

router.get('/getNumber/:number', function (req, res, next) {
    console.log(req.params.number);
    var result = numbers.getNumber(req.params.number);
    result.then(function (response) {
        console.log("response :" + response);
        res.send(response);
    }, function (error) {
        console.log("error " + error);
        res.send(error);
    });
});

router.post('/updateNumberById/:id', function (req, res, next) {
    var newnumber = req.body.number;
    if (newnumber._id)delete newnumber._id;
    console.log(number);
    var result = numbers.updateById(req.params.id, newnumber);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/updateNumberByNumber/:number', function (req, res, next) {
    var newnumber = req.body.number;
    if (newnumber._id)delete newnumber._id;
    var number = req.params.number;
    console.log(numbername);
    var result = numbers.updateByNumber(number, newnumber);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/deleteNumberByNumber/:number', function (req, res, next) {
    var result = numbers.deleteByNumber(req.params.number);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/deleteNumberById/:id', function (req, res, next) {
    var id = req.params.id;
    var result = numbers.deleteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.post('/deleteNumber', function (req, res, next) {
    var id = req.params.id;
    var result = numbers.deleteById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;