import sinon from 'sinon/sinon-esm';
import EventPublisher from 'zb/events/event-publisher';


/**
 */
class PublicEventPublisher extends EventPublisher {
	/**
	 * @param {string} event
	 * @param {...*} args
	 * @protected
	 */
	fireEvent(event, ...args) {
		this._fireEvent(event, ...args);
	}
}


describe('EventPublisher', () => {
	let publisher;

	beforeEach(() => {
		publisher = new PublicEventPublisher();
	});

	afterEach(() => {
		publisher = null;
		sinon.restore();
	});

	it('Should create an instance', () => {
		expect(publisher).to.be.an.instanceof(PublicEventPublisher);
	});

	it('Should call listeners', () => {
		const spy = sinon.spy();

		publisher.on('event', spy);
		publisher.fireEvent('event');

		expect(spy.called).to.be.true;
	});

	it('Should call listeners with arguments', () => {
		const spy = sinon.spy();

		publisher.on('event', spy);
		publisher.fireEvent('event', 'foo');

		expect(spy.calledWithExactly('event', 'foo')).to.be.true;
	});

	it('Should call duplicate listener twice', () => {
		const spy = sinon.spy();

		publisher.on('event', spy);
		publisher.on('event', spy);
		publisher.fireEvent('event', 'foo');

		expect(spy.calledTwice).to.be.true;
	});

	it('Should call listeners in order of subscribing', () => {
		const spy1 = sinon.spy();
		const spy2 = sinon.spy();

		publisher.on('event', spy1);
		publisher.on('event', spy2);
		publisher.fireEvent('event');

		expect(spy1.calledBefore(spy2)).to.be.true;
	});

	it('Should remove listeners', () => {
		const spy = sinon.spy();

		publisher.on('event', spy);
		publisher.off('event', spy);
		publisher.fireEvent('event');

		expect(spy.called).to.be.false;
	});

	it('Removing listeners should not affect other events', () => {
		const spy = sinon.spy();

		publisher.on('event1', spy);
		publisher.on('event2', spy);
		publisher.off('event1', spy);

		publisher.fireEvent('event1');
		publisher.fireEvent('event2');

		expect(spy.calledOnce).to.be.true;
		expect(spy.calledWithExactly('event2')).to.be.true;
	});

	it('Should quietly do nothing when removing non-existent listener', () => {
		expect(
			() => publisher.off('event', () => {/* empty */})
		).not.to.throw;
	});

	it('Should remove all listeners from given event', () => {
		const spyA1 = sinon.spy();
		const spyA2 = sinon.spy();
		const spyB = sinon.spy();

		publisher.on('eventA', spyA1);
		publisher.on('eventA', spyA2);
		publisher.on('eventB', spyB);

		publisher.removeAllListeners('eventA');

		publisher.fireEvent('eventA');
		publisher.fireEvent('eventB');

		expect(spyA1.called).to.be.false;
		expect(spyA2.called).to.be.false;
		expect(spyB.called).to.be.true;
	});

	it('Should remove all listeners from all events', () => {
		const spy1 = sinon.spy();
		const spy2 = sinon.spy();

		publisher.on('event1', spy1);
		publisher.on('event2', spy2);

		publisher.removeAllListeners();

		publisher.fireEvent('event1');
		publisher.fireEvent('event2');

		expect(spy1.called).to.be.false;
		expect(spy2.called).to.be.false;
	});

	it('Should fire EVENT_ANY along with each event', () => {
		const spy = sinon.spy();

		publisher.on(publisher.EVENT_ANY, spy);
		publisher.fireEvent('event1');
		publisher.fireEvent('event2');

		expect(spy.calledTwice).to.be.true;
		expect(spy.firstCall.calledWithExactly('event1')).to.be.true;
		expect(spy.secondCall.calledWithExactly('event2')).to.be.true;
	});

	it('Should not call subsequent listeners after one throws', () => {
		const spy = sinon.spy();

		publisher.on('event', () => {
			throw new Error('Something bad happened');
		});
		publisher.on('event', spy);

		expect(spy.called).to.be.false;
	});

	describe('once', () => {
		it('Should remove once listener after event', () => {
			const spy = sinon.spy();

			publisher.once('event', spy);
			publisher.fireEvent('event');
			publisher.fireEvent('event');

			expect(spy.callCount).eq(1);
		});

		it('Should remove once listener with off method', () => {
			const spy = sinon.spy();

			publisher.once('event', spy);
			publisher.off('event', spy);

			publisher.fireEvent('event');
			expect(spy.called).to.be.false;
		});

		it('Removing of first listener should not break removing of second listener', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.once('event', spy1);
			publisher.once('event', spy2);
			publisher.off('event', spy1);
			publisher.off('event', spy2);

			publisher.fireEvent('event');
			expect(spy1.called).to.be.false;
			expect(spy2.called).to.be.false;
		});

		it('removeAllListeners should remove all once listeners', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.once('event', spy1);
			publisher.once('event', spy2);
			publisher.removeAllListeners();

			publisher.fireEvent('event');
			expect(spy1.called).to.be.false;
			expect(spy2.called).to.be.false;
		});

		it('Same listener should not be removed from other events', () => {
			const spy = sinon.spy();

			publisher.once('event1', spy);
			publisher.once('event2', spy);
			publisher.off('event1', spy);

			publisher.fireEvent('event2');
			expect(spy.calledOnce).to.be.true;
		});
	});

	describe('Event loop', () => {
		it('Should not call listeners added during dispatching', () => {
			const spy = sinon.spy();

			publisher.on('event', () => {
				publisher.on('event', spy);
			});

			publisher.fireEvent('event');

			expect(spy.called).to.be.false;
		});

		it('Should still call listeners removed during dispatching', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.on('event', spy1);
			publisher.on('event', spy2);
			publisher.on('event', () => {
				publisher.off('event', spy2);
			});

			publisher.fireEvent('event');

			expect(spy1.called).to.be.true;
			expect(spy2.called).to.be.true;
		});

		it('Should fire nested events within loop', () => {
			const spyA1 = sinon.spy();
			const spyA2 = sinon.spy();
			const spyB = sinon.spy();

			publisher.on('eventA', spyA1);
			publisher.on('eventA', () => {
				publisher.fireEvent('eventB');
			});
			publisher.on('eventA', spyA2);
			publisher.on('eventB', spyB);

			publisher.fireEvent('eventA');

			expect(spyB.called).to.be.true;

			expect(spyA1.calledImmediatelyBefore(spyB)).to.be.true;
			expect(spyA2.calledImmediatelyAfter(spyB)).to.be.true;
		});

		it('Should not call listeners removed during dispatching for nested events', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.on('event', spy1);
			publisher.on('event', (event, depth) => {
				publisher.off('event', spy2);
				if (depth < 2) {
					publisher.fireEvent('event', depth + 1);
				}
			});
			publisher.on('event', spy2);
			publisher.fireEvent('event', 1);

			expect(spy1.calledTwice).to.be.true;
			expect(spy2.calledOnce).to.be.true;
			expect(spy2.calledWithExactly('event', 1)).to.be.true;
		});

		it('Should run callbacks after event loop', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const afterSpy = sinon.spy();

			publisher.on('event', spy1);
			publisher.on('event', () => {
				publisher.runAfterCurrentEvent(afterSpy);
			});
			publisher.on('event', spy2);
			publisher.fireEvent('event');

			expect(afterSpy.called).to.be.true;

			expect(afterSpy.calledAfter(spy1)).to.be.true;
			expect(afterSpy.calledAfter(spy2)).to.be.true;
		});

		it('runAfterCurrentEvent should throw if no events are running', () => {
			expect(
				() => publisher.runAfterCurrentEvent(() => {/* empty */})
			).to.throw('No events are being fired');
		});

		it('Should run nested callbacks first after event loop', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.on('event1', () => {
				publisher.runAfterCurrentEvent(spy1);
			});
			publisher.on('event1', () => {
				publisher.fireEvent('event2');
			});
			publisher.on('event2', () => {
				publisher.runAfterCurrentEvent(spy2);
			});

			publisher.fireEvent('event1');

			expect(spy2.calledBefore(spy1)).to.be.true;
		});

		it('runAfterCurrentEvent should allow consecutive events', () => {
			const spyA1 = sinon.spy();
			const spyA2 = sinon.spy();
			const spyB = sinon.spy();

			publisher.on('eventA', spyA1);
			publisher.on('eventA', () => {
				publisher.runAfterCurrentEvent(() => publisher.fireEvent('eventB'));
			});
			publisher.on('eventB', spyB);
			publisher.on('eventA', spyA2);

			publisher.fireEvent('eventA');

			expect(spyA1.calledImmediatelyBefore(spyA2)).to.be.true;
			expect(spyA2.calledImmediatelyBefore(spyB)).to.be.true;
		});

		it('once listeners should only be called once within loop', () => {
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();

			publisher.once('event', spy1);
			publisher.on('event', (event, depth) => {
				if (depth < 2) {
					publisher.fireEvent('event', depth + 1);
				}
			});
			publisher.once('event', spy2);
			publisher.fireEvent('event', 1);

			expect(spy1.calledOnce).to.be.true;
			expect(spy2.calledOnce).to.be.true;

			expect(spy1.calledWithExactly('event', 1)).to.be.true;
			expect(spy2.calledWithExactly('event', 2)).to.be.true; // At least that's node EventEmitter behavior
		});
	});
});
