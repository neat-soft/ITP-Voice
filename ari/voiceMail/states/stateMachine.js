/**
 * Created by Lucas on 03/02/16.
 */
function StateMachine() {
    var transitions = {};
    var current_state = null;

    this.add_transition = function (src_state, event, dst_state) {
        if (!transitions.hasOwnProperty(src_state.state_name)) {
            transitions[src_state.state_name] = {};
        }
        transitions[src_state.state_name][event] = dst_state;
    };
    this.change_state = function (event) {
        current_state = transitions[current_state.state_name][event];
        current_state.enter();
    };

    this.start = function (initial_state) {
        current_state = initial_state;
        current_state.enter();
    };
}

module.exports = StateMachine;