import EventPublisher from 'zb/events/event-publisher';


/**
 */
class PublicEventPublisher extends EventPublisher {
	/**
	 * @param {string} event
	 * @param {...*} var_args
	 * @protected
	 */
	fireEvent(event, ...var_args) {
		this._fireEvent(event, ...var_args);
	}
}


function createSpy() {
	const spy = (...args) => {
		spy.called = true;
		spy.calledArgs = args;
	};

	spy.called = false;
	spy.calledArgs = undefined;
	spy.reset = () => {
		spy.called = false;
	};

	return spy;
}

describe('EventPublisher', () => {
	it('Create an instance', () => {
		const ep = new PublicEventPublisher();
		expect(ep).to.be.an.instanceof(PublicEventPublisher);
	});

	it('Remove once listener after event', () => {
		const ep = new PublicEventPublisher();
		const spy = createSpy();

		ep.once('event', spy);
		ep.fireEvent('event');
		expect(spy.called).eq(true);

		spy.reset();
		ep.fireEvent('event');
		expect(spy.called).eq(false);
	});

	it('Remove once listener by off method', () => {
		const ep = new PublicEventPublisher();
		const spy = createSpy();

		ep.once('event', spy);
		ep.off('event', spy);

		ep.fireEvent('event');
		expect(spy.called).eq(false);
	});

	it('Removing of first listener does not break removing of second listener', () => {
		const ep = new PublicEventPublisher();
		const spy1 = createSpy();
		const spy2 = createSpy();

		ep.once('event', spy1);
		ep.once('event', spy2);
		ep.off('event', spy1);
		ep.off('event', spy2);

		ep.fireEvent('event');
		expect(spy2.called).eq(false);
	});

	it('Remove all once listeners by removeAllListeners method', () => {
		const ep = new PublicEventPublisher();
		const spy1 = createSpy();
		const spy2 = createSpy();

		ep.once('event', spy1);
		ep.once('event', spy2);
		ep.removeAllListeners();

		ep.fireEvent('event');
		expect(spy1.called).eq(false);
		expect(spy2.called).eq(false);
	});

	it('The same once listener for multiple events', () => {
		const ep = new PublicEventPublisher();
		const spy = createSpy();

		ep.once('event1', spy);
		ep.once('event2', spy);
		ep.off('event1', spy);

		ep.fireEvent('event2');
		expect(spy.called).eq(true);
	});
});
