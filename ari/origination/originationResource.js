/**
 * Created by Lucas on 21/07/16.
 */
var Q = require('q');
var uuid = require('uuid');
var events = require('events');
var originationDevice = require('./originationDevice');
var originationOffNet = require('./originationOffNet');
var originationGroup = require('./originationGroup');
originationResource = new events.EventEmitter();

originationResource.processDevice = function (client, incoming, device, caller, account, daemonID) {
    var eventID = uuid.v4();
    var outgoingID = uuid.v4();
    originationDevice.on('originationDevice:stopPlayback-'+eventID, function() {
        originationDevice.removeAllListeners('originationDevice:stopPlayback-'+eventID);
        originationResource.emit("originationResource:stopPlayback-" + daemonID);
    });
    originationDevice.on('originationDevice:nextStep-'+eventID, function() {
        originationDevice.removeAllListeners('originationDevice:nextStep-'+eventID);
        originationResource.emit("originationResource:nextStep-" + daemonID);
    });
    originationDevice.process(client, incoming, device, caller, account, outgoingID, eventID);
};
originationResource.processOffNet = function (client, incoming, number, caller, account, daemonID) {
    var eventID = uuid.v4();
    var outgoingID = uuid.v4();
    originationOffNet.on('originationOffNet:stopPlayback-'+eventID, function() {
        originationOffNet.removeAllListeners('originationOffNet:stopPlayback-'+eventID);
        originationResource.emit("originationResource:stopPlayback-" + daemonID);
    });
    originationOffNet.process(client, incoming, number, caller, account, outgoingID, eventID);
};
originationResource.processGroup = function (client, incoming, ringGroup, caller, account, daemonID) {
    var originationID = uuid.v4();
    originationGroup.on('originationGroup:stopPlayback-' + originationID, function () {
        originationGroup.removeAllListeners('originationGroup:stopPlayback-' + originationID);
        originationResource.emit("originationResource:stopPlayback-" + daemonID);
    });
    originationGroup.process(client, incoming, ringGroup, caller, account, originationID);
};

module.exports = originationResource;