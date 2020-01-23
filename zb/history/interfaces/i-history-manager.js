/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IStateful from './i-stateful';


/**
 * @interface
 */
export default class IHistoryManager {
	/**
	 * @param {Array<IStateful>} objects
	 */
	addRecord(objects) {}

	/**
	 * @param {number} delta
	 * @return {Promise}
	 */
	go(delta) {}

	/**
	 * Clear all history records
	 */
	clear() {}

	/**
	 * @return {Promise}
	 */
	forward() {}

	/**
	 * @return {Promise}
	 */
	back() {}

	/**
	 * @return {boolean}
	 */
	canBack() {}

	/**
	 * @return {boolean}
	 */
	canForward() {}
}


/**
 * @type {number}
 */
IHistoryManager.prototype.length;
