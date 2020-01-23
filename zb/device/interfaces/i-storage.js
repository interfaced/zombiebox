/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import UnsupportedFeature from '../errors/unsupported-feature';


/**
 * @interface
 */
export default class IStorage {
	/**
	 * Auto append prefix for all keys
	 * @param {string} prefix
	 * @throws {UnsupportedFeature}
	 */
	setKeyPrefix(prefix) {}

	/**
	 * @param {string} key
	 * @return {?string}
	 * @throws {UnsupportedFeature}
	 */
	getItem(key) {}

	/**
	 * @param {string} key
	 * @param {string} data
	 * @throws {UnsupportedFeature}
	 */
	setItem(key, data) {}

	/**
	 * @param {string} key
	 * @throws {UnsupportedFeature}
	 */
	removeItem(key) {}
}
