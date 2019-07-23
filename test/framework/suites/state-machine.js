import EventPublisher from 'zb/events/event-publisher';
import StateMachine, {InvalidTransitionError, PendingTransitionError} from 'zb/state-machine';


describe('StateMachine', () => {
	const STATE_1 = 'state-1';
	const STATE_2 = 'state-2';
	const STATE_3 = 'state-3';
	const STATE_4 = 'state-4';
	const STATE_5 = 'state-5';

	const transitions = {
		[STATE_1]: [STATE_2, STATE_3],
		[STATE_2]: [STATE_3, STATE_4],
		[STATE_3]: [STATE_4],
		[STATE_4]: []
	};

	describe('Sanity checks', () => {
		it('Should be instantiable', () => {
			expect(() => {
				const sm = new StateMachine({}, STATE_1);
				expect(sm).instanceof(StateMachine);
			}).not.throw();
		});

		it('Should be event publisher', () => {
			expect(new StateMachine({}, STATE_1)).instanceof(EventPublisher);
		});
	});

	describe('Configuration', () => {
		let machine;
		beforeEach(() => {
			machine = new StateMachine(transitions, STATE_1);
		});

		it('Should respect the default state', () => {
			expect(machine.isIn(STATE_1)).be.true;
			expect(machine.isNotIn(STATE_2)).be.true;
			expect(machine.isNotIn(STATE_5)).be.true;
		});

		it('Should return the current state', () => {
			expect(machine.getCurrentState()).equal(STATE_1);
		});

		it('Should allow transition to valid states', () => {
			expect(machine.canTransitTo(STATE_2)).be.true;
			expect(machine.canTransitTo(STATE_3)).be.true;
		});

		it('Should not allow transition to invalid states', () => {
			expect(machine.canTransitTo(STATE_4)).be.false;
			expect(machine.canTransitTo(STATE_5)).be.false;

			expect(machine.cannotTransitTo(STATE_4)).be.true;
			expect(machine.cannotTransitTo(STATE_5)).be.true;
		});

		it('Should return the states that are following from the specific state', () => {
			expect(machine.getStatesFollowingFrom(STATE_1)).deep.equal([STATE_2, STATE_3]);
			expect(machine.getStatesFollowingFrom(STATE_2)).deep.equal([STATE_3, STATE_4]);
			expect(machine.getStatesFollowingFrom(STATE_3)).deep.equal([STATE_4]);
			expect(machine.getStatesFollowingFrom(STATE_4)).deep.equal([]);
			expect(machine.getStatesFollowingFrom(STATE_5)).deep.equal([]);
		});

		it('Should return the states that are leading to the specific state', () => {
			expect(machine.getStatesLeadingTo(STATE_1)).deep.equal([]);
			expect(machine.getStatesLeadingTo(STATE_2)).deep.equal([STATE_1]);
			expect(machine.getStatesLeadingTo(STATE_3)).deep.equal([STATE_1, STATE_2]);
			expect(machine.getStatesLeadingTo(STATE_4)).deep.equal([STATE_2, STATE_3]);
			expect(machine.getStatesLeadingTo(STATE_5)).deep.equal([]);
		});
	});

	describe('Transitions', () => {
		let machine;
		beforeEach(() => {
			machine = new StateMachine(transitions, STATE_1);
		});

		it('Should transit when allowed', () => {
			machine.setState(STATE_2);

			expect(machine.isIn(STATE_2)).be.true;
		});

		it('Should fire enter/exit events', () => {
			let exitEventFired = false;
			let enterEventFired = false;
			let eventOrderIsCorrect = false;

			machine.on(machine.EVENT_STATE_EXIT, (eventName, state) => {
				exitEventFired = state === STATE_1;
				eventOrderIsCorrect = !enterEventFired;
			});

			machine.on(machine.EVENT_STATE_ENTER, (eventName, state) => {
				enterEventFired = state === STATE_2;
				eventOrderIsCorrect = exitEventFired;
			});

			machine.setState(STATE_2);

			expect(exitEventFired).be.true;
			expect(enterEventFired).be.true;
			expect(eventOrderIsCorrect).be.true;
		});

		it('Should throw when the transition is not allowed', () => {
			let anyEventFired = false;

			machine.on(machine.EVENT_STATE_EXIT, () => {
				anyEventFired = true;
			});

			machine.on(machine.EVENT_STATE_ENTER, () => {
				anyEventFired = true;
			});

			expect(anyEventFired).be.false;
			expect(() => {
				machine.setState(STATE_4);
			}).throw(InvalidTransitionError, `Invalid transition from "${STATE_1}" to "${STATE_4}"`);
		});

		it('Should throw when transiting to current state again', () => {
			let anyEventFired = false;

			machine.on(machine.EVENT_STATE_EXIT, () => {
				anyEventFired = true;
			});

			machine.on(machine.EVENT_STATE_ENTER, () => {
				anyEventFired = true;
			});

			expect(anyEventFired).be.false;
			expect(() => {
				machine.setState(STATE_1);
			}).throw(InvalidTransitionError, `Invalid transition from "${STATE_1}" to "${STATE_1}"`);
		});

		it('Should start a pending transition when allowed', () => {
			machine.startTransitionTo(STATE_2);

			expect(machine.hasPendingTransition()).be.true;
		});

		it('Should throw when pending transition is not allowed', () => {
			expect(() => {
				machine.startTransitionTo(STATE_4);
			}).throw(InvalidTransitionError, `Invalid transition from "${STATE_1}" to "${STATE_4}"`);
		});

		it('Should throw when trying to start a pending transition twice', () => {
			machine.startTransitionTo(STATE_2);

			expect(() => {
				machine.startTransitionTo(STATE_2);
			}).throw(PendingTransitionError, `There is a pending transition from "${STATE_1}" to "${STATE_2}"`);
		});

		it('Should throw when trying to transit during a pending transition', () => {
			machine.startTransitionTo(STATE_2);

			expect(() => {
				machine.setState(STATE_3);
			}).throw(PendingTransitionError, `There is a pending transition from "${STATE_1}" to "${STATE_2}"`);
		});

		it('Should return the pending transition', () => {
			machine.startTransitionTo(STATE_2);

			expect(machine.getPendingTransition()).deep.equal({
				from: STATE_1,
				to: STATE_2
			});
		});

		it('Should end the pending transition', () => {
			machine.startTransitionTo(STATE_2);
			machine.setState(STATE_2);

			expect(machine.hasPendingTransition()).be.false;
			expect(machine.isIn(STATE_2)).be.true;
		});

		it('Should be able to transit after end of the pending transition', () => {
			machine.startTransitionTo(STATE_2);
			machine.setState(STATE_2);

			machine.setState(STATE_3);
			expect(machine.isIn(STATE_3));
		});
	});
});
