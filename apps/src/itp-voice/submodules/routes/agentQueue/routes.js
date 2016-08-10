/**
 * Created by Lucas on 10/12/15.
 */
var express = require('express');
var router = express.Router();
var AgentQueues = require('../../controllers/agentQueueController');
var agentQueues = new AgentQueues();
var Numbers = require('../../controllers/numberController');
var numbers = new Numbers();


router.post('/addAgentQueue', function (req, res, next) {
    console.log("addAgentQueue");
    var agentQueue = req.body;
    console.log(agentQueue);
    var result = agentQueues.addAgentQueue(agentQueue);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/listAllAgentQueues', function (req, res, next) {
    console.log(req.body);
    var result = agentQueues.getAllAgentQueues();
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

router.get('/getAQByAgentId/:agentId', function (req, res, next) {
    var agentId = req.params.agentId;
    console.log("agentId: ",agentId);
    var result = agentQueues.getAQByAgentId(agentId)
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getAQByQueueId/:QId', function (req, res, next) {
    var QId = req.params.QId;
    console.log("QId: ",QId);
    var result = agentQueues.getAQByQueueId(QId);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.post('/updateStatusAgent/:agentId', function (req, res, next) {
    var agentId = req.params.agentId;
    status = req.body.status;
    console.log("req.body: ",status);
    console.log("agentId: ",agentId);
    var result = agentQueues.updateStatusAgent(agentId, status);
    result.then(function (response) {
        console.log("****",response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getAgentQueueById/:id', function (req, res, next) {
    var id = req.params.id;
    console.log(id);
    var result = agentQueues.getAgentQueueById(id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.get('/getAgentQueueByExtension/:extension', function (req, res, next) {
    console.log(req.params.extension);
    var extension = req.params.extension;
    var resultExtension = agentQueues.getAgentQueueByExtension(extension);
    resultExtension.then(function (agentAgentQueue) {
        console.log("AgentQueue :", agentAgentQueue);
        res.send(agentAgentQueue);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});


router.post('/updateAgentQueueById/:id', function (req, res, next) {
    var agentAgentQueue = req.body;
    if (agentAgentQueue._id)delete agentAgentQueue._id;
    var result = agentQueues.updateById(req.params.id, agentAgentQueue);
    result.then(function (response) {
        console.log("success\n" + response);
        res.send(response);
    }, function (error) {
        console.log("error\n" + error);
        res.send(error);
    });
});

router.post('/addUserToQ/:id', function (req, res, next) {
    console.log("=========================>:",req);
    var user = req.body.user;
    var id = req.params.id;
    var result = agentQueues.addUserToQ(id, user);
    result.then(function (response) {
        console.log("success update agentAgentQueue add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update agentAgentQueue add user:  ", error);
        res.send(error);
    });
});

router.post('/updateQ/:id', function (req, res, next) {
    var body = req.body;
    console.log("**updateQ: ",body);
    var id = req.params.id;
    var result = agentQueues.updateQ(id, body);
    result.then(function (response) {
        console.log("success update agentAgentQueue add user: ",response);
        res.send(response);
    }, function (error) {
        console.log("error update agentAgentQueue add user:  ", error);
        res.send(error);
    });
});

router.delete('/deleteAgentQueueByName/:agentAgentQueuename', function (req, res, next) {
    var agentAgentQueuename = req.params.agentAgentQueuename;
    console.log(agentAgentQueuename);

    var result = agentQueues.deleteByAgentQueuename(agentAgentQueuename);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});
router.delete('/deleteAgentQueueById/:id', function (req, res, next) {
    var result = agentQueues.deleteById(req.params.id);
    result.then(function (response) {
        console.log(response);
        res.send(response);
    }, function (error) {
        console.log(error);
        res.send(error);
    });
});

module.exports = router;