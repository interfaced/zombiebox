/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import EventPublisher from '../events/event-publisher';
import IDevice from './interfaces/i-device';
import IInfo from './interfaces/i-info';
import IInput from './interfaces/i-input';
import IStorage from './interfaces/i-storage';


/**
 * @abstract
 * @implements {IDevice}
 */
export default class AbstractDevice extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {IInfo}
		 */
		this.info = null;

		/**
		 * @type {IInput}
		 */
		this.input = null;

		/**
		 * @type {IStorage}
		 */
		this.storage = null;

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_READY = 'ready';
	}

	/**
	 * @abstract
	 * @override
	 */
	init() {}

	/**
	 * @abstract
	 * @override
	 */
	createVideo(rect) {}

	/**
	 * @abstract
	 * @override
	 */
	createStatefulVideo() {}

	/**
	 * @abstract
	 * @override
	 */
	exit() {}

	/**
	 * @abstract
	 * @override
	 */
	getMAC() {}

	/**
	 * @abstract
	 * @override
	 */
	getIP() {}

	/**
	 * @abstract
	 * @override
	 */
	setOSDOpacity(value) {}

	/**
	 * @abstract
	 * @override
	 */
	getOSDOpacity() {}

	/**
	 * @abstract
	 * @override
	 */
	setOSDChromaKey(chromaKey) {}

	/**
	 * @abstract
	 * @override
	 */
	getOSDChromaKey() {}

	/**
	 * @abstract
	 * @override
	 */
	removeOSDChromaKey() {}

	/**
	 * @abstract
	 * @override
	 */
	getLaunchParams() {}

	/**
	 * @abstract
	 * @override
	 */
	getEnvironment() {}

	/**
	 * @abstract
	 * @override
	 */
	hasOSDOpacityFeature() {}

	/**
	 * @abstract
	 * @override
	 */
	hasOSDAlphaBlendingFeature() {}

	/**
	 * @abstract
	 * @override
	 */
	hasOSDChromaKeyFeature() {}

	/**
	 * @abstract
	 * @override
	 */
	isUHDSupported() {}

	/**
	 * @abstract
	 * @override
	 */
	isUHD8KSupported() {}
}
