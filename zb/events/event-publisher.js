/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {info} from '../console/console';
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
		 * Event callbacks that being called by wrappers
		 * @type {!Object<string, Array<Listener>>}
		 * @protected
		 */
		this._onceMapCallbacks = {};

		/**
		 * Event wrappers that call their callbacks
		 * @type {!Object<string, Array<Listener>>}
		 * @protected
		 */
		this._onceMapWrappers = {};

		/**
		 * Current executing event
		 * @type {?string}
		 * @protected
		 */
		this._executingEvent = null;

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
		if (!this._listeners.hasOwnProperty(event)) {
			this._listeners[event] = [];
		}

		this._cloneListenersOnWrite(event);
		this._listeners[event].push(callback);
	}

	/**
	 * Add disposable event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	once(event, callback) {
		const wrapper = (...var_args) => {
			this.off(event, wrapper);

			callback(...var_args);
		};

		if (!this._onceMapCallbacks.hasOwnProperty(event)) {
			this._onceMapCallbacks[event] = [];
		}

		if (!this._onceMapWrappers.hasOwnProperty(event)) {
			this._onceMapWrappers[event] = [];
		}

		this._onceMapCallbacks[event].push(callback);
		this._onceMapWrappers[event].push(wrapper);

		this.on(event, wrapper);
	}

	/**
	 * Remove event listener
	 * @param {string} event
	 * @param {Listener} callback
	 */
	off(event, callback) {
		if (!this._listeners.hasOwnProperty(event)) {
			return;
		}

		const eventOnceWrappers = this._onceMapWrappers[event] || [];
		const eventOnceCallbacks = this._onceMapCallbacks[event] || [];

		const i = this._listeners[event].indexOf(callback);
		if (i !== -1) {
			const onceWrapperIndex = eventOnceWrappers.indexOf(callback);

			this._cloneListenersOnWrite(event, {logInfo: onceWrapperIndex === -1});
			this._listeners[event].splice(i, 1);

			if (onceWrapperIndex !== -1) {
				eventOnceWrappers.splice(onceWrapperIndex, 1);
				eventOnceCallbacks.splice(onceWrapperIndex, 1);
			}
		}

		let onceCallbackIndex;
		while ((onceCallbackIndex = eventOnceCallbacks.indexOf(callback)) !== -1) {
			this.off(event, eventOnceWrappers[onceCallbackIndex]);
		}
	}

	/**
	 * Remove all event listeners
	 * @param {string=} opt_event
	 */
	removeAllListeners(opt_event) {
		const allListeners = this._listeners;
		const eventsToRemove = opt_event ? [opt_event] : Object.keys(allListeners);

		eventsToRemove.forEach((event) => {
			// "off" mutates listeners, so use a copy instead of an original array
			const eventListeners = allListeners[event].slice();

			eventListeners.forEach((listener) => {
				this.off(event, listener);
			});
		});
	}

	/**
	 * @param {string} event
	 * @param {{
	 *     logInfo: (boolean|undefined)
	 * }=} opt_options
	 * @protected
	 */
	_cloneListenersOnWrite(event, {logInfo = true} = {}) {
		if (this._executingEvent === event) {
			const oldListeners = this._listeners[event];

			let newListeners = [];
			if (oldListeners && oldListeners.length) {
				newListeners = oldListeners.slice(0);
			}

			this._listeners[event] = newListeners;

			if (logInfo) {
				info(
					`Clone listeners for event "${event}" during the execution phase. ` +
					`This may lead to a low-predictable order of callbacks executing and performance degradation ` +
					`when event has a large number of listeners.`
				);
			}
		}
	}

	/**
	 * Trigger all subscribed event listeners
	 * @param {string} event
	 * @param {...*} var_args
	 * @protected
	 */
	_fireEvent(event, ...var_args) {
		// Save refs to prevent mutation during event execution
		const eventListeners = this._listeners[event];
		const anyEventListeners = this._listeners[this.EVENT_ANY];

		this._executingEvent = event;
		this._callListeners(eventListeners, event, var_args);

		this._executingEvent = this.EVENT_ANY;
		this._callListeners(anyEventListeners, event, var_args);

		this._executingEvent = null;
	}

	/**
	 * @param {Array<Listener>|undefined} listeners
	 * @param {string} event
	 * @param {Array<*>} args
	 * @protected
	 */
	_callListeners(listeners, event, args) {
		if (listeners) {
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
}


/**
 * @typedef {function(string, ...?)}
 */
export let Listener;
