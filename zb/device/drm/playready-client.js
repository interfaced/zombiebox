/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import AbstractDRMClient from './abstract-drm-client';
import {Type} from './drm';


/**
 */
export default class PlayReadyClient extends AbstractDRMClient {
	/**
	 * @param {string=} licenseServer
	 */
	constructor(licenseServer) {
		super();

		this.type = Type.PLAYREADY;

		/**
		 * @type {?string}
		 */
		this.licenseServer = licenseServer || null;
	}

	/**
	 * @return {?string}
	 */
	getCustomData() {
		return null;
	}
}
