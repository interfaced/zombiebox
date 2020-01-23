/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IDrmClient from '../interfaces/i-drm-client';
import EventPublisher from '../../events/event-publisher';


/**
 * @implements {IDrmClient}
 */
export default class AbstractDRMClient extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {string}
		 */
		this.type;

		/**
		 * Fired with: {Error}
		 * @const {string}
		 */
		this.EVENT_ERROR = 'error';
	}

	/**
	 * @return {Promise}
	 */
	init() {
		return Promise.resolve();
	}

	/**
	 * @return {Promise}
	 */
	prepare() {
		return Promise.resolve();
	}

	/**
	 * @return {Promise}
	 */
	destroy() {
		return Promise.resolve();
	}
}
