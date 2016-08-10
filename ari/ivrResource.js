var events = require('events');
var ivrResource = new events.EventEmitter();
var resources = {
    'originateResource': require('./originateResource'),
    'menuResource': require('./toRemoveAfterTest/menuResource'),
    'queueResource': require('./queueResource')
};

ivrResource.TAG = "ivrResource";
ivrResource.endEvent = "ivr:end";
ivrResource.start = function (client,event, channel, ivr, type) {
    console.log("Module ivr: ",ivr);
    console.log("TYPE from start resource ivr: ",type);
    executeIvr(client, event, channel, ivr);
};
var executeIvr = function (client, event, channel, ivr) {
    var module = ivr.module;
    var type = ivr.type;
    console.log("######################TYPE ###############:",type);
    switch (type) {
        case "device":
        case "ringGroup":
        case "number":
            var resource = "originateResource";
            break;
        case "menu":
            var resource = "menuResource";
            break;
        case "queue":
            var resource = "queueResource";
            break;
        default:
            console.log("unhandled use case: ",event);
            console.log("after unhandled");
            channel.hangup();
            break;
    }
    resources[resource].start(client, event, channel, module, type);
};

module.exports = ivrResource;