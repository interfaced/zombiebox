/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from '../errors/unsupported-feature';
import IEventPublisher from '../../events/interfaces/i-event-publisher';
import Rect from '../../geometry/rect';
import IInfo from './i-info';
import IInput from './i-input';
import IStorage from './i-storage';
import IVideo from './i-video';
import IStatefulVideo from './i-stateful-video';


/**
 * @interface
 * @extends {IEventPublisher}
 */
export default class IDevice {
	/**
	 * Initializes all device properties: info, input, storage, etc..
	 */
	init() {}

	/**
	 * @param {Rect} rect
	 * @return {IVideo}
	 * @throws {UnsupportedFeature}
	 */
	createVideo(rect) {}

	/**
	 * @return {IStatefulVideo}
	 * @throws {UnsupportedFeature}
	 */
	createStatefulVideo() {}

	/**
	 * Returns MAC address of active network connection
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	getMAC() {}

	/**
	 * Returns IP address of active network connection
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	getIP() {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	exit() {}

	/**
	 * @param {number} value 0..1
	 * @throws {UnsupportedFeature}
	 */
	setOSDOpacity(value) {}

	/**
	 * @return {number} 0..1
	 * @throws {UnsupportedFeature}
	 */
	getOSDOpacity() {}

	/**
	 * @param {string} chromaKey
	 * @throws {UnsupportedFeature}
	 */
	setOSDChromaKey(chromaKey) {}

	/**
	 * @return {?string}
	 * @throws {UnsupportedFeature}
	 */
	getOSDChromaKey() {}

	/**
	 * @throws {UnsupportedFeature}
	 */
	removeOSDChromaKey() {}

	/**
	 * @return {boolean}
	 */
	hasOSDOpacityFeature() {}

	/**
	 * @return {boolean}
	 */
	hasOSDAlphaBlendingFeature() {}

	/**
	 * @return {boolean}
	 */
	hasOSDChromaKeyFeature() {}

	/**
	 * Whether quad (1440p) and ultra (2160p) resolutions are supported by device
	 * @return {boolean}
	 */
	isUHDSupported() {}

	/**
	 * Whether 4320 resolution is supported by device
	 * @return {boolean}
	 */
	isUHD8KSupported() {}

	/**
	 * Returns system environment variables (if any)
	 * @return {Object}
	 * @throws {UnsupportedFeature}
	 */
	getEnvironment() {}

	/**
	 * Returns params that application was launched with (if any)
	 * @return {Object}
	 * @throws {UnsupportedFeature}
	 */
	getLaunchParams() {}

	/**
	 * Detects that current environment is device environment
	 * @return {boolean}
	 */
	static detect() {}
}


/**
 * @type {IInfo}
 */
IDevice.prototype.info;


/**
 * @type {IInput}
 */
IDevice.prototype.input;


/**
 * @type {IStorage}
 */
IDevice.prototype.storage;


/**
 * Fired with: nothing
 * @const {string}
 */
IDevice.prototype.EVENT_READY;
