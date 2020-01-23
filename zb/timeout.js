/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 */
export default class Timeout {
	/**
	 * @param {Function} callback
	 * @param {number} delay
	 */
	constructor(callback, delay) {
		/**
		 * @type {number}
		 * @private
		 */
		this._timeoutId = NaN;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._fired = false;

		/**
		 * @type {?Function}
		 * @private
		 */
		this._callback = callback;

		/**
		 * @type {number}
		 * @private
		 */
		this._delay = delay;

		/**
		 * @type {Function}
		 * @private
		 */
		this._executeCallback = () => {
			this._fired = true;
			if (this._callback) {
				this._callback();
			}
		};
	}

	/**
	 * Start timeout. To restart, use the method "reset".
	 */
	start() {
		if (this.isInProgress()) {
			// Already started
			return;
		}

		this._fired = false;
		this._timeoutId = setTimeout(this._executeCallback, this._delay);
	}

	/**
	 * Stop callback execution.
	 */
	stop() {
		clearTimeout(this._timeoutId);
		this._timeoutId = NaN;
	}

	/**
	 * Reset timeout.
	 */
	restart() {
		this.stop();
		this.start();
	}

	/**
	 * Stop timeout and force callback execution.
	 */
	force() {
		this.stop();
		this._executeCallback();
	}

	/**
	 * @return {boolean}
	 */
	isInProgress() {
		return !Number.isNaN(this._timeoutId);
	}

	/**
	 * @return {boolean}
	 */
	isFired() {
		return this._fired;
	}

	/**
	 * @param {Function=} callback
	 */
	setCallback(callback = null) {
		this._callback = callback;
	}

	/**
	 * @param {number} delay
	 */
	setDelay(delay) {
		this._delay = delay;
	}

	/**
	 * @return {number}
	 */
	getDelay() {
		return this._delay;
	}
}
