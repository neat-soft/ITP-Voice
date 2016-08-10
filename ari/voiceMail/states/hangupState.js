/**
 * Created by Lucas on 03/02/16.
 */
function HungUpState(call) {
    this.state_name = "hungup";
    this.enter = function () {
        channel_name = call.channel.name;
        console.log("Channel %s hung up", channel_name);
    }
}

module.exports = HungUpState;