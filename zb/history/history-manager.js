/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IHistoryManager from './interfaces/i-history-manager';
import IStateful from './interfaces/i-stateful';


/**
 * @implements {IHistoryManager}
 */
export default class HistoryManager {
	/**
	 */
	constructor() {
		/**
		 * @type {Array<HistoryRecord>}
		 * @protected
		 */
		this._records = [];

		/**
		 * @type {number}
		 * @protected
		 */
		this._currentPosition = -1;
	}

	/**
	 * @param {Array<IStateful>} objects
	 */
	addRecord(objects) {
		this._saveCurrentState();
		this._currentPosition++;

		this._records = this._records.slice(0, this._currentPosition);
		this._records.push({
			objects: objects,
			state: []
		});
	}

	/**
	 * @param {number} delta
	 * @return {Promise}
	 */
	go(delta) {
		const record = this._records[this._currentPosition + delta];
		if (delta === 0 || !record) {
			return Promise.resolve();
		}

		return Promise.resolve()
			.then(() => {
				this._saveCurrentState();

				return this._loadState(record);
			})
			.then(() => {
				this._currentPosition += delta;
			});
	}

	/**
	 * Clear all history records
	 */
	clear() {
		this._records = [];
		this._currentPosition = -1;
	}

	/**
	 * @return {Promise}
	 */
	forward() {
		return this.go(+1);
	}

	/**
	 * @return {Promise}
	 */
	back() {
		return this.go(-1);
	}

	/**
	 * @return {boolean}
	 */
	canBack() {
		return this._currentPosition > 0;
	}

	/**
	 * @return {boolean}
	 */
	canForward() {
		return this._currentPosition < (this._records.length - 1);
	}

	/**
	 * @return {number}
	 */
	get length() {
		return this._records.length;
	}

	/**
	 * @return {HistoryRecord}
	 * @protected
	 */
	_getCurrentRecord() {
		return this._records[this._currentPosition] || null;
	}

	/**
	 * @protected
	 */
	_saveCurrentState() {
		const currentRecord = this._getCurrentRecord();
		if (currentRecord) {
			this._saveState(currentRecord);
		}
	}

	/**
	 * @param {HistoryRecord} record
	 * @protected
	 */
	_saveState(record) {
		record.state = record.objects
			.map((object) => object.takeSnapshot());
	}

	/**
	 * @param {HistoryRecord} record
	 * @return {Promise}
	 * @protected
	 */
	_loadState(record) {
		return record.state.filter(Boolean)
			.reduce((thread, snapshot) => thread.then(snapshot), Promise.resolve());
	}
}


/**
 * @typedef {{
 *     objects: Array<IStateful>,
 *     state: Array<Function>
 * }}
 */
export let HistoryRecord;
