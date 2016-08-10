/**
 * Created by Lucas on 03/02/16.
 */
function endingState(call) {
    this.state_name = "ending";
    this.enter = function() {
        var channel_name = call.channel.name;
        console.log("Ending voice mail call from", channel_name);
        call.channel.hangup();
    }
}

module.exports = endingState;