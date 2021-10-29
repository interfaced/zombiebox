/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IEventPublisher from 'zb/events/interfaces/i-event-publisher';


/**
 * @interface
 * @template ItemType
 * @extends {IEventPublisher}
 */
export default class IList {
	/**
	 * @return {boolean}
	 */
	isLoading() {}

	/**
	 * @return {Promise<IList>}
	 */
	preload() {}

	/**
	 * @return {number}
	 */
	getBufferStart() {}

	/**
	 * @param {boolean} value
	 */
	setAutoSelect(value) {}

	/**
	 * Clear data.
	 */
	clear() {}

	/**
	 * @return {number}
	 */
	size() {}

	/**
	 * @param {Array<!ItemType>} items
	 */
	addItems(items) {}

	/**
	 * @param {Array<!ItemType>} items
	 * @param {number} index
	 */
	addItemsAt(items, index) {}

	/**
	 * @param {Array<!ItemType>} items
	 * @return {boolean}
	 */
	removeItems(items) {}

	/**
	 * @param {Array<!ItemType>} items
	 */
	setItems(items) {}

	/**
	 * @param {!ItemType} item
	 */
	add(item) {}

	/**
	 * @param {!ItemType} item
	 * @param {number} index
	 */
	addAt(item, index) {}

	/**
	 * @param {!ItemType} item
	 * @return {boolean}
	 */
	remove(item) {}

	/**
	 * @param {number} index
	 * @return {boolean}
	 */
	removeAt(index) {}

	/**
	 * @param {!ItemType} item
	 * @return {boolean}
	 */
	select(item) {}

	/**
	 * @param {number} index
	 * @return {boolean}
	 */
	selectAt(index) {}

	/**
	 * @param {!ItemType} item
	 * @return {number} -1 if not found
	 */
	indexOf(item) {}

	/**
	 * @param {number} index
	 * @return {boolean}
	 */
	isValidIndex(index) {}

	/**
	 * @return {?ItemType}
	 */
	current() {}

	/**
	 * @return {number}
	 */
	currentIndex() {}

	/**
	 * @param {number} index
	 * @return {?ItemType}
	 */
	itemAt(index) {}

	/**
	 * @param {number=} step Default 1.
	 * @return {boolean}
	 */
	selectNextItem(step) {}

	/**
	 * @param {number=} step Default 1.
	 * @return {boolean}
	 */
	selectPrevItem(step) {}

	/**
	 * @return {Array<ItemType>}
	 */
	toArray() {}
}


/**
 * @const {string} Fired with args: item, index, prevItem, prevIndex
 */
IList.prototype.EVENT_ITEM_SELECTED;


/**
 * @const {string} Fired without args.
 */
IList.prototype.EVENT_CLEAR;


/**
 * @const {string} Fired with args: item
 */
IList.prototype.EVENT_FIRST_ITEM_ADDED;


/**
 * @const {string} Fired with args: item, index
 */
IList.prototype.EVENT_ITEM_ADDED;


/**
 * @const {string} Fired with args: Array<!ItemType>
 */
IList.prototype.EVENT_ITEMS_ADDED;


/**
 * @const {string} Fired with args: item, index
 */
IList.prototype.EVENT_ITEM_REMOVED;


/**
 * @const {string} Fired with args: Array<!ItemType>
 */
IList.prototype.EVENT_ITEMS_REMOVED;


/**
 * @const {string} Fired with args: Array<!ItemType>
 */
IList.prototype.EVENT_ITEMS_CHANGED;
