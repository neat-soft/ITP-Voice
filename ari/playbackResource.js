var events = require('events');
var playbackResource = new events.EventEmitter();

playbackResource.playback;

playbackResource.TAG = "originateResource";

playbackResource.endEvent = "playback:end";

playbackResource.start = function(client, channel, module) {
    console.log("start module playback");
    playbackResource.playback = client.Playback();
    playbackResource.playback.on('PlaybackFinished', function() {
        playbackResource.emit('playback:end');
    });
    console.log(module.data.file);
    playbackResource.play(channel, {media: module.data.file}, function() {
        console.log("playback running");
    })
};

playbackResource.play = function(channel, file, callback) {
    channel.play(file, playbackResource.playback, callback);
};

module.exports = playbackResource;
