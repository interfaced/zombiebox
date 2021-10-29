/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import EventPublisher from 'zb/events/event-publisher';
import IList from './i-list';


/**
 * @template ItemType
 * @implements {IList}
 */
export default class List extends EventPublisher {
	/**
	 * @param {Array<!ItemType>=} items
	 */
	constructor(items) {
		super();

		/**
		 * @type {Array<ItemType>}
		 * @protected
		 */
		this._items;

		/**
		 * @type {number}
		 * @protected
		 */
		this._currentIndex;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._autoSelect;

		this._items = [];
		this._currentIndex = NaN;
		this._autoSelect = true;
		if (items) {
			this.setItems(items);
		}
	}

	/**
	 * @override
	 */
	isLoading() {
		return false;
	}

	/**
	 * @override
	 */
	preload() {
		return /** @type {Promise<IList>} */ (Promise.resolve(this));
	}

	/**
	 * @override
	 */
	getBufferStart() {
		return 0;
	}

	/**
	 * @override
	 */
	clear() {
		this.selectAt(NaN);
		this._items.splice(0, this._items.length);
		this._fireEvent(this.EVENT_CLEAR);
	}

	/**
	 * @override
	 */
	setAutoSelect(value) {
		this._autoSelect = value;
	}

	/**
	 * @override
	 */
	size() {
		return this._items.length;
	}

	/**
	 * @override
	 */
	addItems(items) {
		this.addItemsAt(items, this.size());
	}

	/**
	 * @override
	 */
	addItemsAt(items, index) {
		for (let i = 0; i < items.length; i++) {
			this._addAt(items[i], index + i);
		}
		this._fireEvent(this.EVENT_ITEMS_ADDED, items, index);
	}

	/**
	 * @override
	 */
	removeItems(items) {
		let isSomeoneRemoved = false;
		const reallyRemovedItems = [];

		for (let i = 0; i < items.length; i++) {
			if (this._removeAt(this.indexOf(items[i]))) {
				isSomeoneRemoved = true;
				reallyRemovedItems.push(items[i]);
			}
		}

		this._fireEvent(this.EVENT_ITEMS_REMOVED, reallyRemovedItems);

		return isSomeoneRemoved;
	}

	/**
	 * @override
	 */
	setItems(items) {
		this.clear();
		this.addItems(items);
		this._fireEvent(this.EVENT_ITEMS_CHANGED, items);
	}

	/**
	 * @override
	 */
	add(item) {
		this.addAt(item, this.size());
	}

	/**
	 * @override
	 */
	addAt(item, index) {
		this.addItemsAt([item], index);
	}

	/**
	 * @override
	 */
	remove(item) {
		return this.removeAt(this.indexOf(item));
	}

	/**
	 * @override
	 */
	removeAt(index) {
		return this.removeItems([this._items[index]]);
	}

	/**
	 * @override
	 */
	select(item) {
		return this.selectAt(this.indexOf(item));
	}

	/**
	 * @override
	 */
	selectAt(index) {
		if (this.isValidIndex(index) || isNaN(index)) {
			if (index !== this._currentIndex) {
				const prevItem = this.current();
				const prevIndex = this.currentIndex();
				this._currentIndex = index;
				this._fireEvent(this.EVENT_ITEM_SELECTED, this.current(), this.currentIndex(), prevItem, prevIndex);
			}
			return true;
		}
		return false;
	}

	/**
	 * @override
	 */
	indexOf(item) {
		return this._items.indexOf(item);
	}

	/**
	 * @override
	 */
	isValidIndex(index) {
		return index >= 0 && index < this._items.length;
	}

	/**
	 * @override
	 */
	current() {
		return this.itemAt(this.currentIndex());
	}

	/**
	 * @override
	 */
	currentIndex() {
		return this._currentIndex;
	}

	/**
	 * @override
	 */
	itemAt(index) {
		if (!this.isValidIndex(index)) {
			return null;
		}
		return this._items[index];
	}

	/**
	 * @override
	 */
	selectNextItem(step) {
		const fixedStep = isNaN(step) ? 1 : (step < 1 ? 1 : step);
		return this.selectAt(this.currentIndex() + fixedStep);
	}

	/**
	 * @override
	 */
	selectPrevItem(step) {
		const fixedStep = isNaN(step) ? 1 : (step < 1 ? 1 : step);
		return this.selectAt(this.currentIndex() - fixedStep);
	}

	/**
	 * @override
	 */
	toArray() {
		return this._items;
	}

	/**
	 * Select first item.
	 * @return {boolean}
	 */
	selectFirst() {
		return this.selectAt(0);
	}

	/**
	 * Select last item.
	 * @return {boolean}
	 */
	selectLast() {
		return this.selectAt(this.size() - 1);
	}

	/**
	 * @param {!ItemType} item
	 * @param {number} index
	 * @protected
	 */
	_addAt(item, index) {
		const currentIndex = this.currentIndex();
		let changedIndex = null;
		let fireSelectAt = false;

		this._items.splice(index, 0, item);

		if (this._autoSelect && isNaN(currentIndex)) {
			fireSelectAt = true;

			changedIndex = 0;
		} else if (!isNaN(currentIndex) && currentIndex >= index) {
			if (this._autoSelect && currentIndex === index) {
				fireSelectAt = true;
			}

			changedIndex = currentIndex + 1;
		}

		this._currentIndex = changedIndex === null ? currentIndex : changedIndex;

		this._fireEvent(this.EVENT_ITEM_ADDED, item, index);

		if (this.size() === 1) {
			this._fireEvent(this.EVENT_FIRST_ITEM_ADDED, item);
		}

		this._currentIndex = currentIndex;

		if (changedIndex !== null) {
			if (fireSelectAt) {
				this.selectAt(changedIndex);
			} else {
				this._currentIndex = changedIndex;
			}
		}
	}

	/**
	 * @param {number} index
	 * @return {boolean}
	 * @protected
	 */
	_removeAt(index) {
		if (!this.isValidIndex(index)) {
			return false;
		}

		const currentIndex = this.currentIndex();
		const removedItem = this._items.splice(index, 1)[0];

		let changedIndex = null;
		let fireSelectAt = false;

		if (!isNaN(currentIndex)) {
			if (currentIndex === index) {
				this._currentIndex = NaN;
				changedIndex = NaN;

				if (this.isValidIndex(index)) {
					changedIndex = currentIndex;
				} else if (this.isValidIndex(index - 1)) {
					changedIndex = index - 1;
				}

				fireSelectAt = true;
			} else if (currentIndex > index) {
				changedIndex = currentIndex - 1;
			}
		}

		this._fireEvent(this.EVENT_ITEM_REMOVED, removedItem, index);

		if (changedIndex !== null) {
			if (fireSelectAt) {
				this.selectAt(changedIndex);
			} else {
				this._currentIndex = changedIndex;
			}
		}

		if (this.size() === 0) {
			this._fireEvent(this.EVENT_CLEAR);
		}

		return true;
	}
}


/**
 * Fired with: item {!ItemType}, index {number}, prevItem {!ItemType}, prevIndex {number}
 * @const {string}
 */
List.prototype.EVENT_ITEM_SELECTED = 'item-selected';


/**
 * Fired with: none
 * @const {string}
 */
List.prototype.EVENT_CLEAR = 'clear';


/**
 * Fired with: item {!ItemType}
 * @const {string}
 */
List.prototype.EVENT_FIRST_ITEM_ADDED = 'first-item-added';


/**
 * Fired with: item {!ItemType}, index {number}
 * @const {string}
 */
List.prototype.EVENT_ITEM_ADDED = 'item-added';


/**
 * Fired with: items {Array<!ItemType>}, index {number}
 * @const {string}
 */
List.prototype.EVENT_ITEMS_ADDED = 'items-added';


/**
 * Fired with: item {!ItemType}, index {number}
 * @const {string}
 */
List.prototype.EVENT_ITEM_REMOVED = 'item-removed';


/**
 * Fired with: items {Array<!ItemType>}
 * @const {string}
 */
List.prototype.EVENT_ITEMS_REMOVED = 'items-removed';


/**
 * Fired with: items {Array<!ItemType>}
 * @const {string}
 */
List.prototype.EVENT_ITEMS_CHANGED = 'items-changed';
