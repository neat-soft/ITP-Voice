/**
 * Created by Lucas on 28/07/16.
 */
var Q = require('q');
var events = require('events');
var originationResource = require('./../origination/originationResource');
var ifProcess = require('./ifProcess');
ifResource = new events.EventEmitter();

ifResource.processIf = function (client, incoming, ifModule,  caller, account, daemonID) {
    var variableName = ifModule.expression.replace(/!/g, '').split("=")[0];
    client.channels.getChannelVar({channelId: incoming.id, variable: variableName}, function (err, variable) {
        if(err){
            console.log("Error to get variable from channel: ", incoming.id, err);
            originationResource.emit("originationResource:nextStep-" + daemonID);
        }else{
            if(ifModule.expression.replace(new RegExp(variableName, 'g'), variable.value))
                ifProcess.process(client, incoming, ifModule.execution_if_true.module, caller, account, daemonID);
            else
                ifProcess.process(client, incoming, ifModule.execution_if_false.module, caller, account, daemonID);
        }
    });
};

module.exports = ifResource;