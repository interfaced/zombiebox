/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
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
	 * @return {IThenable}
	 */
	go(delta) {}

	/**
	 * Clear all history records
	 */
	clear() {}

	/**
	 * @return {IThenable}
	 */
	forward() {}

	/**
	 * @return {IThenable}
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
