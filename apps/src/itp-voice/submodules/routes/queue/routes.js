/**
 * Created by Lucas on 10/12/15.
 */
var express = require('express');
var router = express.Router();
var Queues = require('../../controllers/queueController');
var queues = new Queues();


router.post('/addQueue', function (req, res, next) {
    console.log("Body : ", req);
    var queue = req.body;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in queue)
            var result = queues.addQueue(queue);
        else
            res.send({error: "account ID is required"});
    } else {
        queue.account = account._id;
        var result = queues.addQueue(queue);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/', function (req, res, next) {
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = queues.getAllQueues();
    } else {
        var result = queues.getAllQueues(account._id);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = queues.getQueueById(id);
    } else {
        var result = queues.getQueueById(id, account._id);
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
    var queue = req.body;
    if (queue._id)delete queue._id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        if ("account" in queue)
            var result = queues.updateById(req.params.id, queue);
        else
            res.send({error: "account ID is required"});
    } else {
        queue.account = account._id;
        var result = queues.updateById(req.params.id, queue);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = queues.deleteById(id);
    } else {
        var result = queues.deleteById(id, account._id);
    }
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.get('/getQueueByName/:nameQ', function (req, res, next) {
    var nameQ = req.params.nameQ;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = queues.getQueueByName(nameQ);
    } else {
        var result = queues.getQueueByName(nameQ, account._id);
    }
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getQueueByExtension/:extension', function (req, res, next) {
    var extension = req.params.extension;
    var account = req.user[0];
    var role = account.role;
    if(role === "super_admin") {
        var result = queues.getQueueByExtension(extension);
    } else {
        var result = queues.getQueueByExtension(extension, account._id);
    }
    result.then(function (queue) {
        console.log("Queue :", queue);
        res.send(queue);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteQueueByName/:queuename', function (req, res, next) {
    var queuename = req.params.queuename;
    var result = queues.deleteByQueuename(queuename);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

/* need to be tested */
router.post('/getQueue', function (req, res, next) {
    var queue = req.body.queue;
    result.then(function (response) {
        res.send(response);
    }, function (error) {
        res.send(error);
    });
});
router.post('/addUserToQ/:id', function (req, res, next) {
    var user = req.body.user;
    var id = req.params.id;
    var result = queues.addUserToQ(id, user);
    result.then(function (response) {
        console.log("success update queue add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update queue add user:  ", error);
        res.send(error);
    });
});



module.exports = router;