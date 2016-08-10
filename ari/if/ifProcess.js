var Q = require('q');
var uuid = require('uuid');
var events = require('events');
var originationResource = require('./../origination/originationResource');
var ifProcess = new events.EventEmitter();
var outgoings = {};

ifProcess.process = function (client, incoming, module, caller, account, daemonID) {
    var deferred = Q.defer();
    console.log("in ifProcess.process: ", module);
    switch (module.type) {
        case "get":
            var variable = module.module;
            originationResource.processGet(client, incoming, variable, daemonID);
            break;
        case "if":
            var ifModule = module.module;
            originationResource.processIf(client, incoming, ifModule, caller, account, daemonID);
            break;
        case "device":
            var device = module.module.sip_settings;
            originationResource.processDevice(client, incoming, device, caller, account, daemonID);
            break;
        case "ringGroup":
            var ringGroup = module.module.resources;
            originationResource.processGroup(client, incoming, ringGroup, caller, account, daemonID);
            break;
        case "offNet":
            var number = module.module.number;
            originationResource.processOffNet(client, incoming, number, caller, account, daemonID);
            break;
        default:
            //TODO: Menu && Queue
            console.log("Module not supported yet", module.type);
            break;
    }
    return deferred.promise;
};

module.exports = ifProcess;