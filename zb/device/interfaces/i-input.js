/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from '../errors/unsupported-feature';
import Key from '../input/key';
import IEventPublisher from '../../events/interfaces/i-event-publisher';


/**
 * @interface
 * @extends {IEventPublisher}
 */
export default class IInput {
	/**
	 * @param {(KeyboardEvent|WheelEvent)} e
	 * @return {Key}
	 */
	eventToKeyCode(e) {}

	/**
	 * @param {KeyboardEvent} keyboardEvent
	 * @return {?string} Printable char or group of chars
	 */
	eventToPrintableChar(keyboardEvent) {}

	/**
	 * @param {Key} zbKey
	 * @return {?string} Printable char or group of chars
	 */
	keyToPrintableChar(zbKey) {}

	/**
	 * @param {function((KeyboardEvent|WheelEvent))} handler
	 */
	setKeyEventHandler(handler) {}

	/**
	 * Blocks user input and doesn't pass input device events to handlers
	 * @return {number} Block id.
	 */
	block() {}

	/**
	 * Unblocks user input and continues passing input device events to handlers
	 * @param {number} id Block id from .block() result
	 */
	unblock(id) {}

	/**
	 * Is input blocked?
	 * @return {boolean}
	 */
	isBlocked() {}

	/**
	 * Checks if platform supports pointing device
	 * @return {boolean}
	 */
	isPointingDeviceSupported() {}

	/**
	 * Checks if pointing device is active now
	 * @return {boolean}
	 */
	isPointingDeviceActive() {}

	/**
	 * Enables pointing device
	 * @throws {UnsupportedFeature}
	 */
	enablePointingDevice() {}

	/**
	 * Disables pointing device
	 * @param {number=} timeout
	 * @throws {UnsupportedFeature}
	 */
	disablePointingDevice(timeout) {}

	/**
	 * Enables IDLE deactivation of pointing device
	 * @param {number=} timeout
	 */
	enablePointingDeviceIdle(timeout) {}

	/**
	 * Disables IDLE deactivation of pointing device
	 */
	disablePointingDeviceIdle() {}

	/**
	 * @param {number} ms
	 * @return {boolean}
	 */
	setPointingDeviceIdleTime(ms) {}
}


/**
 * UI is now controlling using device with pointer support
 * Fired with: nothing
 * @const {string}
 */
IInput.prototype.EVENT_POINTING_DEVICE_ACTIVATED;


/**
 * UI is now controlling using device without pointer support
 * Fired with: nothing
 * @const {string}
 */
IInput.prototype.EVENT_POINTING_DEVICE_DEACTIVATED;
