/**
 * Created by Lucas on 25/07/16.
 */
var events = require('events');
var menuProcess = new events.EventEmitter();
var SoundsController = require('./../soundsController');
var soundsController = new SoundsController();

menuProcess.TAG = "menuResource";
menuProcess.endEvent = "menu:end";

menuProcess.process = function (client, event, incoming, module) {
    var digitsArr = [], dates = [];
    var sounds = [];
    for (var i = 0; i < module.length; i++) {
        sounds.push(module[i].sound);
        digitsArr.push(module[i].digit);
    }
    var greeting = sounds.join(", ");
    soundsController.createBook(greeting)
        .then(function (file) {
            var playback = client.Playback();
            incoming.play({media: 'sound:option-is-invalid'}, playback, function (err, playback) {
                    if (err) {
                        throw err;
                    }
                });
            incoming.on('ChannelDtmfReceived',
                function (event, channel) {
                    var dateEvent = new Date(event.timestamp);
                    var hours = dateEvent.getHours(),
                        minutes = dateEvent.getMinutes(),
                        seconds = dateEvent.getSeconds();
                    var date = hours + ":" + minutes + ":" + seconds;
                    var digit = parseInt(event.digit);
                    var valid = digitsArr.indexOf(digit);
                    if (valid != -1 && dates.indexOf(date) <= -1) {
                        dates.push(date);
                        var evt = {
                            channelState: "menuDigit",
                            digit: digit
                        };
                        menuProcess.emit('menuProcess:digitDtmf', evt);
                    } else if (dates.indexOf(date) > -1) {
                    } else {
                        var playback = client.Playback();
                        channel.play({media: 'sound:option-is-invalid'}, playback, function (err, playback) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                }, function (error) {
                    console.log(error);
                });
        });
};

module.exports = menuProcess;