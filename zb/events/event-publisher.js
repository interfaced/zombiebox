/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IEventPublisher from './interfaces/i-event-publisher';


/**
 * @implements {IEventPublisher}
 */
export default class EventPublisher {
	/**
	 */
	constructor() {
		/**
		 * Event listeners
		 * @type {!Object<string, Array<Listener>>}
		 * @protected
		 */
		this._listeners = {};

		/**
		 * @type {Array<OnceRecord>}
		 * @protected
		 */
		this._onceRecords = [];

		/**
		 * @type {?EventExecutionContext}
		 * @protected
		 */
		this._currentContext = null;

		/**
		 * Warning: use this event only for development purposes
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_ANY = 'any';
	}

	/**
	 * Add event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	on(event, callback) {
		if (!this._listeners[event]) {
			this._listeners[event] = [];
		}

		this._listeners[event].push(callback);
	}

	/**
	 * Add disposable event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	once(event, callback) {
		const record = {
			callback,
			wrapper: null,
			called: false
		};

		const wrapper = (...args) => {
			// This prevents duplicate execution in some very specific cases:
			// When similar events get nested, listeners are frozen and .off will not remove a pending listener
			if (record.called) {
				return;
			}

			record.called = true;
			this.off(event, wrapper);

			callback(...args);
		};
		record.wrapper = wrapper;

		this._onceRecords.push(/** @type {OnceRecord} */ (record));

		this.on(event, wrapper);
	}

	/**
	 * Remove event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	off(event, callback) {
		if (!this._listeners[event]) {
			return;
		}

		let index = this._listeners[event].indexOf(callback);

		if (index === -1) {
			const wrapperIndex = this._onceRecords.findIndex(
				({callback: wrappedCallback}) => wrappedCallback === callback
			);

			if (wrapperIndex !== -1) {
				const {wrapper} = this._onceRecords[wrapperIndex];
				this._onceRecords.splice(wrapperIndex, 1);

				index = this._listeners[event].indexOf(wrapper);
			}
		}

		if (index === -1) {
			return;
		}

		if (1 === this._listeners[event].length) {
			this._listeners[event] = [];
		} else {
			this._listeners[event].splice(index, 1);
		}
	}

	/**
	 * Remove all event listeners
	 * @param {string=} event
	 */
	removeAllListeners(event) {
		if (event !== undefined && this._listeners[event]) {
			this._listeners[event] = null;
		} else {
			this._listeners = {};
		}
	}

	/**
	 * Runs after current event loop is done calling all of its listeners
	 * Only intended to be used from within event handlers
	 * @param {Function} callback
	 */
	runAfterCurrentEvent(callback) {
		if (!this._currentContext) {
			throw new Error('No events are being fired');
		}

		this._currentContext.runAfter.push(callback);
	}

	/**
	 * Trigger all subscribed event listeners
	 * @param {string} event
	 * @param {...*} args
	 * @protected
	 */
	_fireEvent(event, ...args) {
		// Not supposed to be fired explicitly
		if (event === this.EVENT_ANY) {
			return;
		}

		let listeners = [];

		if (this._listeners[event] && this._listeners[event].length) {
			listeners = listeners.concat(this._listeners[event]);
		}

		if (this._listeners[this.EVENT_ANY] && this._listeners[this.EVENT_ANY].length) {
			listeners = listeners.concat(this._listeners[this.EVENT_ANY]);
		}

		if (!listeners.length) {
			return;
		}

		/**
		 * @type {EventExecutionContext}
		 */
		const context = {
			listeners,
			event,
			args,
			runAfter: []
		};

		const previousContext = this._currentContext;
		this._currentContext = context;

		this._callListeners(context);

		for (const callback of context.runAfter) {
			callback();
		}

		this._currentContext = previousContext;
	}

	/**
	 * @param {EventExecutionContext} context
	 * @protected
	 */
	_callListeners({listeners, event, args}) {
		for (let i = 0, len = listeners.length; i < len; i++) {
			const listener = listeners[i];

			switch (args.length) {
				// Fast cases
				case 0:
					listener.call(null, event);
					break;
				case 1:
					listener.call(null, event, args[0]);
					break;
				case 2:
					listener.call(null, event, args[0], args[1]);
					break;
				case 3:
					listener.call(null, event, args[0], args[1], args[2]);
					break;
				case 4:
					listener.call(null, event, args[0], args[1], args[2], args[3]);
					break;
				case 5:
					listener.call(null, event, args[0], args[1], args[2], args[3], args[4]);
					break;
				// Slower
				default:
					listener(...[event].concat(args));
			}
		}
	}
}


/**
 * @typedef {function(string, ...?)}
 */
export let Listener;


/**
 * @typedef {{
 *     callback: !Listener,
 *     called: boolean,
 *     wrapper: !Listener
 * }}
 */
let OnceRecord;


/**
 * @typedef {{
 *     listeners: !Array<Listener>,
 *     event: string,
 *     args: !Array<*>,
 *     runAfter: !Array<Function>
 * }}
 */
let EventExecutionContext;
