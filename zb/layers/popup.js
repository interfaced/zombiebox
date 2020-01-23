/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Layer from './layer';


/**
 */
export default class Popup extends Layer {
	/**
	 */
	constructor() {
		super();

		/**
		 * Fired with: {*} status
		 * @const {string}
		 */
		this.EVENT_CLOSE = 'close';

		this._addContainerClass('_popup');
	}

	/**
	 * @param {*} status
	 */
	close(status) {
		// Notify parent layer about close
		this._fireEvent(this.EVENT_NEED_TO_BE_HIDDEN);

		// Notify popup opener
		this._fireEvent(this.EVENT_CLOSE, status);
	}
}
