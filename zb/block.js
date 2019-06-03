/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {always} from './promise';
import EventPublisher from './events/event-publisher';


/**
 */
export default class Block extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isBlocked = false;

		/**
		 * @type {Array<IThenable>}
		 * @protected
		 */
		this._blocks = [];

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_BLOCK = 'block';

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_UNBLOCK = 'unblock';
	}

	/**
	 * @param {IThenable} promise
	 * @return {IThenable}
	 */
	block(promise) {
		if (-1 !== this._blocks.indexOf(promise)) {
			return promise;
		}

		this._blocks.push(promise);
		this._setBlocked(true);

		always(promise, this._unblock.bind(this, promise));

		return promise;
	}

	/**
	 * @return {boolean}
	 */
	isBlocked() {
		return this._isBlocked;
	}

	/**
	 * @param {boolean} isBlocked
	 * @protected
	 */
	_setBlocked(isBlocked) {
		if (this._isBlocked === isBlocked) {
			return;
		}

		this._isBlocked = isBlocked;

		if (isBlocked) {
			this._fireEvent(this.EVENT_BLOCK);
		} else {
			this._fireEvent(this.EVENT_UNBLOCK);
		}
	}

	/**
	 * @param {IThenable} promise
	 * @protected
	 */
	_unblock(promise) {
		const index = this._blocks.indexOf(promise);
		if (index > -1) {
			this._blocks.splice(index, 1);
		}

		if (!this._blocks.length) {
			this._setBlocked(false);
		}
	}
}
