/**
 * Created by Lucas on 28/07/16.
 */
var events = require('events');
var menuProcess = require('./menuProcess');
var originationResource = require('./../origination/originationResource');
var Api = require('./../api');
var api = new Api();
var menuDTMF = new events.EventEmitter();

menuDTMF.fireListeners = function (client, incoming, module, caller, account, daemonID, playback) {
    menuProcess.removeAllListeners("menuProcess:digitDtmf");
    menuProcess.once("menuProcess:digitDtmf", function (data) {
        console.log("Event DTMF: ", data);
        var jsonDigit = {
            digit: data.digit,
            options: module
        };
        api.getMenuOptionByDigit(jsonDigit, account)
            .then(function (result) {
                incoming.play({media: 'tone:ring;tonezone=us'}, playback, function (err, result) {});
                console.log("result: ", result);
                switch (result.type) {
                    case "device":
                        originationResource.processDevice(client, incoming, result.module, caller, account, daemonID);
                        break;
                    case "ringGroup":
                        originationResource.processGroup(client, incoming, result.module, caller, account, daemonID);
                        break;
                    case "offNet":
                        originationResource.processOffNet(client, incoming, result.module, caller, account, daemonID);
                        break;
                    default:
                        console.log("Nothing to do here !!!!");
                        break;
                }
            }, function (err) {
                console.log(err)
            });
    });
};

menuDTMF.process = function (client, event, incoming, module, caller, account, daemonID, playback){
    menuDTMF.fireListeners(client, incoming, module, caller, account, daemonID, playback);
    menuProcess.process(client, event, incoming, module);
};

module.exports = menuDTMF;