/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Timeout from '../timeout';
import EventPublisher from '../events/event-publisher';
import IInput from './interfaces/i-input';
import Key from './input/key';


/**
 * @abstract
 * @implements {IInput}
 */
export default class AbstractInput extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * Defines if user input is available right now
		 * @type {boolean}
		 * @protected
		 */
		this._isBlocked = false;

		/**
		 * @type {Array<number>}
		 * @protected
		 */
		this._blocks = [];

		/**
		 * @type {number}
		 * @protected
		 */
		this._blockId = 0;

		/**
		 * @type {Object<number, Key>}
		 * @protected
		 */
		this._map = this._createKeysMap();

		/**
		 * @type {?function((KeyboardEvent|WheelEvent))}
		 * @protected
		 */
		this._keyHandler = null;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isPassiveOptionSupported = false;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isPointingDeviceActive = false;

		/**
		 * @type {?Timeout}
		 * @protected
		 */
		this._pointingDeviceIdleTimeout = null;

		/**
		 * @type {number}
		 * @protected
		 */
		this._pointingDeviceIdleTimeoutDelay = DEFAULT_IDLE_TIMEOUT_DELAY;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_POINTING_DEVICE_ACTIVATED = 'pointing-device-activated';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_POINTING_DEVICE_DEACTIVATED = 'pointing-device-deactivated';

		this._setPointingStateActive = this._setPointingStateActive.bind(this);
		this._setPointingStateInactive = this._setPointingStateInactive.bind(this);

		this._detectPassiveOptionSupport();

		this._bindListeners();
		this._listenForPointingState();

		this.enablePointingDeviceIdle();
	}

	/**
	 * @override
	 */
	block() {
		this._blocks.push(++this._blockId);
		this._setBlocked(true);

		return this._blockId;
	}

	/**
	 * @override
	 */
	unblock(id) {
		const index = this._blocks.indexOf(id);
		if (index !== -1) {
			this._blocks.splice(index, 1);
		}

		if (this._blocks.length === 0) {
			this._setBlocked(false);
		}
	}

	/**
	 * @override
	 */
	isBlocked() {
		return this._isBlocked;
	}

	/**
	 * @override
	 */
	eventToKeyCode(e) {
		if (e.type === 'wheel' || e.type === 'mousewheel') {
			return this._wheelEventToKeyCode(/** @type {WheelEvent} */ (e));
		}

		return this._keyboardEventToKeyCode(/** @type {KeyboardEvent} */ (e));
	}

	/**
	 * @override
	 */
	eventToPrintableChar(keyboardEvent) {
		const zbKey = this.eventToKeyCode(keyboardEvent);

		return this.keyToPrintableChar(zbKey);
	}

	/**
	 * @override
	 */
	keyToPrintableChar(zbKey) {
		const zbKeys = Key;
		const zbCharKeys = {};
		zbCharKeys[zbKeys.DIGIT_0] = '0';
		zbCharKeys[zbKeys.DIGIT_1] = '1';
		zbCharKeys[zbKeys.DIGIT_2] = '2';
		zbCharKeys[zbKeys.DIGIT_3] = '3';
		zbCharKeys[zbKeys.DIGIT_4] = '4';
		zbCharKeys[zbKeys.DIGIT_5] = '5';
		zbCharKeys[zbKeys.DIGIT_6] = '6';
		zbCharKeys[zbKeys.DIGIT_7] = '7';
		zbCharKeys[zbKeys.DIGIT_8] = '8';
		zbCharKeys[zbKeys.DIGIT_9] = '9';

		if (zbCharKeys.hasOwnProperty(zbKey)) {
			return zbCharKeys[zbKey];
		}

		return null;
	}

	/**
	 * @override
	 */
	setKeyEventHandler(handler) {
		this._keyHandler = handler;
	}

	/**
	 * @override
	 */
	isPointingDeviceActive() {
		return this._isPointingDeviceActive;
	}

	/**
	 * @override
	 */
	disablePointingDeviceIdle() {
		if (this._pointingDeviceIdleTimeout) {
			this._pointingDeviceIdleTimeout.stop();
		}

		this._pointingDeviceIdleTimeout = null;
	}

	/**
	 * @override
	 */
	enablePointingDeviceIdle(timeout) {
		if (!isNaN(timeout) && isFinite(timeout)) {
			this._pointingDeviceIdleTimeoutDelay = /** @type {number} */ (timeout);
		}

		this.disablePointingDeviceIdle();

		this._pointingDeviceIdleTimeout = new Timeout(
			this._setPointingStateInactive,
			this._pointingDeviceIdleTimeoutDelay
		);
	}

	/**
	 * @override
	 */
	setPointingDeviceIdleTime(ms) {
		if (!isNaN(ms) && isFinite(ms)) {
			this._pointingDeviceIdleTimeoutDelay = ms;

			if (this._pointingDeviceIdleTimeout) {
				this._pointingDeviceIdleTimeout.setDelay(ms);
				this._pointingDeviceIdleTimeout.restart();
			}

			return true;
		}

		return false;
	}

	/**
	 * @abstract
	 * @override
	 */
	isPointingDeviceSupported() {}

	/**
	 * @abstract
	 * @override
	 */
	enablePointingDevice() {}

	/**
	 * @abstract
	 * @override
	 */
	disablePointingDevice(timeout) {}

	/**
	 * @abstract
	 * @return {Object<number, Key>}
	 * @protected
	 */
	_createKeysMap() {}

	/**
	 * @protected
	 */
	_detectPassiveOptionSupport() {
		try {
			window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
				get: () => { // eslint-disable-line getter-return
					this._isPassiveOptionSupported = true;
				}})
			);
		} catch (e) {
			// Do nothing
		}
	}

	/**
	 * @protected
	 */
	_bindListeners() {
		['keydown', 'mousewheel', 'wheel'].forEach((eventName) => {
			document.addEventListener(eventName, (...args) => {
				if (this._keyHandler) {
					this._keyHandler(...args);
				}
			}, this._isPassiveOptionSupported && {'passive': false});
		});
	}

	/**
	 * @param {boolean} blocked
	 * @protected
	 */
	_setBlocked(blocked) {
		this._isBlocked = blocked;
	}

	/**
	 * @param {KeyboardEvent} keyboardEvent
	 * @return {Key}
	 * @protected
	 */
	_keyboardEventToKeyCode(keyboardEvent) {
		const keyCode = keyboardEvent.keyCode;
		if (this._map.hasOwnProperty(String(keyCode))) {
			return this._map[keyCode];
		}

		return Key.UNKNOWN;
	}

	/**
	 * @param {WheelEvent} wheelEvent
	 * @return {Key}
	 * @protected
	 */
	_wheelEventToKeyCode(wheelEvent) {
		const getDelta = (axis) => {
			if ((`delta${axis}`) in wheelEvent) {
				return wheelEvent[`delta${axis}`];
			} else if ((`wheelDelta${axis}`) in wheelEvent) {
				return -wheelEvent[`wheelDelta${axis}`];
			}

			return 0;
		};

		const deltaX = getDelta('X');
		let deltaY = getDelta('Y');

		// Direction can't be determined in this case
		if (deltaX && deltaY) {
			return Key.UNKNOWN;
		}

		// Fallback to another one standard
		if (!deltaX && !deltaY) {
			if ('wheelDelta' in wheelEvent) {
				deltaY = -wheelEvent.wheelDelta;
			}
		}

		const direction = Math.sign(deltaX || deltaY);
		if (!direction) {
			return Key.UNKNOWN;
		}

		if (deltaX) {
			return direction > 0 ?
				Key.MOUSE_WHEEL_RIGHT :
				Key.MOUSE_WHEEL_LEFT;
		}

		if (deltaY) {
			return direction > 0 ?
				Key.MOUSE_WHEEL_DOWN :
				Key.MOUSE_WHEEL_UP;
		}

		return Key.UNKNOWN;
	}

	/**
	 * @protected
	 */
	_setPointingStateActive() {
		this._setPointingState(true);
	}

	/**
	 * @protected
	 */
	_setPointingStateInactive() {
		this._setPointingState(false);
	}

	/**
	 * @param {boolean} isActive
	 * @protected
	 */
	_setPointingState(isActive) {
		if (this._pointingDeviceIdleTimeout) {
			if (isActive) {
				this._pointingDeviceIdleTimeout.restart();
			} else {
				this._pointingDeviceIdleTimeout.stop();
			}
		}

		if (this._isPointingDeviceActive === isActive) {
			return;
		}

		this._isPointingDeviceActive = isActive;

		this._fireEvent(isActive ?
			this.EVENT_POINTING_DEVICE_ACTIVATED :
			this.EVENT_POINTING_DEVICE_DEACTIVATED
		);
	}

	/**
	 * @protected
	 */
	_listenForPointingState() {
		const activatePointing = this._setPointingStateActive.bind(this);
		const deactivatePointing = this._setPointingStateInactive.bind(this);
		const body = document.body;

		/**
		 * @param {string} event
		 * @param {Function} callback
		 */
		const addBodyListener = (event, callback) => {
			body.addEventListener(event, callback, this._isPassiveOptionSupported ? {
				'passive': true,
				'capture': false
			} : false);
		};

		['mouseenter', 'mousemove', 'mouseup', 'mousedown', 'mousewheel', 'wheel']
			.forEach((event) => addBodyListener(event, activatePointing));

		addBodyListener('mouseleave', deactivatePointing);

		addBodyListener('mouseover', (e) => {
			if (e && !e.fromElement && !e.relatedTarget) {
				activatePointing();
			}
		});

		addBodyListener('mouseout', (e) => {
			if (e && !e.toElement && !e.relatedTarget) {
				deactivatePointing();
			}
		});
	}
}


/**
 * @const {number}
 */
export const DEFAULT_IDLE_TIMEOUT_DELAY = 15 * 1000;
