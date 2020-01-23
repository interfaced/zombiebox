/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {div, text} from '../../html';
import BaseLogger from './base-logger';


/**
 */
export default class Screen extends BaseLogger {
	/**
	 * @param {number=} liveTime
	 * @param {number=} itemRemoveDelay
	 */
	constructor(liveTime = DEFAULT_ITEM_LIVE_TIME, itemRemoveDelay = DEFAULT_ITEM_REMOVE_DELAY) {
		super();

		/**
		 * @type {number}
		 * @protected
		 */
		this._liveTime = liveTime;

		/**
		 * @type {number}
		 * @protected
		 */
		this._itemRemoveDelay = itemRemoveDelay;

		/**
		 * @type {?HTMLElement}
		 * @protected
		 */
		this._container = null;

		/**
		 * @type {number}
		 * @protected
		 */
		this._itemsCount = 0;
	}

	/**
	 * @override
	 */
	_send(level, args) {
		const item = div('zb-debug-screen__item');

		text(item, args.map(String).join(' '));

		this._getContainer().appendChild(item);
		this._itemsCount++;

		setTimeout(
			this._removeItem.bind(this, item),
			this._liveTime + (this._itemsCount * this._itemRemoveDelay)
		);
	}

	/**
	 * @return {!HTMLDivElement}
	 * @protected
	 */
	_getContainer() {
		if (!this._container) {
			this._container = div('zb-debug-screen');
			document.body.appendChild(this._container);
		}

		return /** @type {!HTMLDivElement} */ (this._container);
	}

	/**
	 * @param {HTMLDivElement} item
	 * @protected
	 */
	_removeItem(item) {
		this._container.removeChild(item);
		this._itemsCount--;

		if (!this._itemsCount) {
			document.body.removeChild(this._container);
			this._container = null;
		}
	}
}


/**
 * @const {number}
 */
export const DEFAULT_ITEM_LIVE_TIME = 5 * 1000;


/**
 * @const {number}
 */
export const DEFAULT_ITEM_REMOVE_DELAY = 1 * 1000;
