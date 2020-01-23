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
export default class VerimatrixClient extends AbstractDRMClient {
	/**
	 * @param {Params} params
	 */
	constructor(params) {
		super();

		this.type = Type.VERIMATRIX;

		/**
		 * @type {Params}
		 * @protected
		 */
		this._params = params;
	}

	/**
	 * @return {Params}
	 */
	getParams() {
		return this._params;
	}
}


/**
 * @typedef {{
 *     company: (string|undefined),
 *     address: (string|undefined),
 *     iptv: (string|undefined)
 * }}
 */
export let Params;
