/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Type} from '../drm/drm';
import IEventPublisher from '../../events/interfaces/i-event-publisher';


/**
 * @interface
 * @extends {IEventPublisher}
 */
export default class IDrmClient {
	/**
	 */
	constructor() {
		/**
		 * @type {Type|string}
		 */
		this.type;

		/**
		 * Fired with: {Error}
		 * @const {string}
		 */
		this.EVENT_ERROR;
	}

	/**
	 * Called when DRM client is attached to Video object. Do device or backend specific initialisation here.
	 * @return {Promise}
	 */
	init() {}

	/**
	 * Called when Video starts preparing media stream, do stream specific initialisation here.
	 * @return {Promise}
	 */
	prepare() {}

	/**
	 * @return {Promise}
	 */
	destroy() {}
}
