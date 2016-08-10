/**
 * Created by Lucas on 03/02/16.
 */
var Event = require('./../events');
var path = require('path');

function recordingState(call) {
    this.state_name = "recording";

    this.enter = function () {
        console.log("Call client,  call path", call.vm_path);
        var recording = call.client.LiveRecording(call.client, {name: call.vm_path});
        var playback = call.client.Playback();
        var urlGreeting = path.normalize('/home/harraz/Development/ITP-Voice-Plateform/ari/sounds/recording_greeting.wav');
        call.channel.play({media: "sound:/home/harraz/Development/ITP-Voice-Plateform/ari/sounds/recording_greeting"}, playback);

        console.log("Entering recording state");
        call.channel.on("ChannelHangupRequest", on_hangup);
        call.channel.on("ChannelDtmfReceived", on_dtmf);
        call.client.on("PlaybackFinished", on_playback_finished);

        function cleanup() {
            call.channel.removeListener('ChannelHangupRequest', on_hangup);
            call.channel.removeListener('ChannelDtmfReceived', on_dtmf);
            call.client.removeListener('PlaybackFinished', on_playback_finished);
        }

        function on_hangup(event, channel) {
            console.log("Accepted recording %s on hangup", recording.name);
            cleanup();
            call.state_machine.change_state(Event.HANGUP);
        }

        function on_playback_finished(event) {
            console.log("Finished Playback", event);
            call.channel.record(
                {name: recording.name, format: 'wav', beep: true, ifExists: 'overwrite'},
                function (err, live) {
                    console.log("record error", err);
                }
            );
        }

        function on_dtmf(event, channel) {
            var dateEvent = new Date(event.timestamp);
            var dates = [], digits = [];
            var hours = dateEvent.getHours(),
                minutes = dateEvent.getMinutes(),
                seconds = dateEvent.getSeconds();
            var date = hours + ":" + minutes + ":" + seconds;
            var digit = parseInt(event.digit);
            if (dates.indexOf(date) > -1) {
                return
            } else {
                dates.push(date);
                digits.push(event.digit);
            }
            digits = digits.join('');
            switch (digits) {
                case '#':
                    console.log("Reviewing recording", call.vm_path);
                    cleanup();
                    recording.stop(function (err) {
                        console.log("call recording state end record err ", err);
                        call.state_machine.change_state(Event.DTMF_OCTOTHORPE);
                    });
                    break;
                // NEW CONTENT
                case '*':
                    console.log("Canceling recording", call.vm_path);
                    cleanup();
                    recording.cancel(function (err) {
                        call.state_machine.change_state(Event.DTMF_STAR);
                    });
                    break;
            }
        }
    }
}

module.exports = recordingState;