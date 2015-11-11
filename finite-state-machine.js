ig.module('plugins.finite-state-machine')
.requires()
.defines(function() {

    var unnamedTransitionCounter = 0;

    FiniteStateMachine = new ig.Class.extend({
        state: {},
        transitions = {},
        // Track states by name.
        initialState: null,
        currentState: null,
        previousState: null,

        state: function(name, definition) {
            if (!definition) {
                return this.states[name];
            }
            this.states[name] = definition;
            if (!this.initialState) {
                this.initialState = name;
            }
        },

        transition: function(name, fromState, toState, predicate) {
            if (!fromState && !toState && !predicate) {
                return this.transitions[name];
            }
            // Transitions don't require names.
            if (!predicate) {
                predicate = toState;
                toState = fromState;
                fromState = name;
                name = 'transition-' + unnamedTransitionCounter;
                unnamedTransitionCounter += 1;
            }
            if (!this.states[fromState]) {
                throw new Error('Missing from state: ' + fromState);
            }
            if (!this.states[toState]) {
                throw new Error('Missing to state: ' + toState);
            }
            var transition = {
                name: name,
                fromState: fromState,
                toState: toState,
                predicate: predicate
            };
            this.transitions[name] = transition;
            return transition;
        },

        update: function() {
            if (!this.currentState) {
                this.currentState = this.initialState;
            }
            var state = this.state(this.currentState);
            if (this.previousState !== this.currentState) {
                if (state.enter) {
                    state.enter();
                }
                this.previousState = this.currentState;
            }
            if (state.update) {
                state.update();
            }
            // Iterate through transitions.
            for (var name in this.transitions) {
                var transition = this.transitions[name];
                if (transition.fromState === this.currentState &&
                    transition.predicate()) {
                    if (state.exit) {
                        state.exit();
                    }
                    this.currentState = transition.toState;
                    return;
                }
            }
        }
    });
});