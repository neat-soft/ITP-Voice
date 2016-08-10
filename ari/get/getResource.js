var Q = require('q');
var events = require('events');
var originationResource = require('./../origination/originationResource');
getResource = new events.EventEmitter();

getResource.processGet = function (client, incoming, module, daemonID) {
    var variableName = Object.keys(module)[0];
    var variable = module[variableName];
    client.channels.setChannelVar({channelId: incoming.id, variable: variableName, value: variable}, function () {
        originationResource.emit("originationResource:nextStep-" + daemonID);
    });
};

module.exports = getResource;