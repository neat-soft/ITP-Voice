var Event = require('./events');
var request = require('request');
var config = require("./config/config");
var fs = require("fs");
var restler = require("restler");
var Q = require('q');

function ReviewingState(call) {
    this.state_name = "reviewing";
    
    this.enter = function () {
        console.log("Entering reviewing state");
        var playback = call.client.Playback();
        var url = "recording:" + call.vm_path;
        call.channel.on("ChannelHangupRequest", on_hangup);
        call.channel.on("ChannelDtmfReceived", on_dtmf);
        call.client.once("PlaybackFinished", on_playback_finished);
        call.channel.play({media: url}, playback);

        function cleanup() {
            call.channel.removeListener('ChannelHangupRequest', on_hangup);
            call.channel.removeListener('ChannelDtmfReceived', on_dtmf);
            call.client.removeListener('PlaybackFinished', on_playback_finished);
            if (playback) {
                playback.stop();
            }
        }

        function on_hangup(event, channel) {
            console.log("Accepted recording %s on hangup", call.vm_path);
            playback = null;
            cleanup();
            call.state_machine.change_state(Event.HANGUP);
        }

        function on_playback_finished(event) {
            call.channel.play({media: "sound:/home/harraz/Development/ITP-Voice-Plateform/ari/sounds/reviewing_recording"}, playback);
        }

        function on_dtmf(event, channel) {
            switch (event.digit) {
                case '#':
                    console.log("Accepted recording", call.vm_path);
                    console.log("VM_patht from reviewing state", call.vm_path);
                    var name = call.vm_path;
                    var id = call.mailBox._id;
                    var account = call.mailBox.account;
                    var obj = {
                        name: name,
                        type: "voicemail",
                        id: id,
                        account: account
                    };
                    console.log("Voice Mail: Objet to UploadRecorder ", obj);
                    var uploadResult = uploadRecording(obj);
                    cleanup();
                    console.log(call.state_machine);
                    call.state_machine.change_state(Event.DTMF_OCTOTHORPE);
                    break;
                case '*':
                    console.log("Canceling recording", call.vm_path);
                    cleanup();
                    call.client.recordings.deleteStored({recordingName: call.vm_path});
                    call.state_machine.change_state(Event.DTMF_STAR);
                    break;
            }
        }

        function uploadRecording(obj) {
            var nameForm = obj.name + '.wav';
            var resName = nameForm.split("/");
            fs.stat('/var/spool/asterisk/recording/'  + nameForm, function (err, stats) {
                restler.post('http://192.112.255.30:3000/recording/add-record?apikey=f7af1b2b-69f3-489', {
                    multipart: true,
                    data: {
                        "filename": resName[1],
                        "audio": restler.file('/var/spool/asterisk/recording/'  + nameForm, null, stats.size, null, "audio/wav"),
                        "type": obj.type,
                        "id": obj.id,
                        "account": obj.account
                    }
                }).on("complete", function (data) {
                    console.log('Voice mail: Recording upload completed ', data);
                });
            });
        }
    }
}

module.exports = ReviewingState;