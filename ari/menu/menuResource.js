/**
 * Created by Lucas on 25/07/16.
 */
var events = require('events');
var uuid = require('uuid');
var menuResource = new events.EventEmitter();
var menuDTMF = require('./menuDTMF');

menuResource.TAG = "menuResource";
menuResource.endEvent = "menu:end";

menuResource.processMenu = function (client, event, channel, module, caller, account, daemonID, playback) {
    menuDTMF.process(client, event, channel, module, caller, account, daemonID, playback);
};

module.exports = menuResource;