/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {error} from '../../console/console';
import IStorage from '../interfaces/i-storage';


/**
 * @implements {IStorage}
 */
export default class LocalStorage {
	/**
	 */
	constructor() {
		/**
		 * @type {string}
		 * @protected
		 */
		this._prefix = '';
	}

	/**
	 * @override
	 */
	setKeyPrefix(prefix) {
		this._prefix = prefix;
	}

	/**
	 * @override
	 */
	getItem(key) {
		return window.localStorage.getItem(this._prefix + key);
	}

	/**
	 * @override
	 */
	setItem(key, value) {
		try {
			window.localStorage.setItem(this._prefix + key, value);
		} catch (e) {
			let msg = `Storage error: ${e}`;
			if (e.name === 'QUOTA_EXCEEDED_ERR') {
				msg = 'No space left on device';
			}
			error(msg);
			throw msg;
		}
	}

	/**
	 * @override
	 */
	removeItem(key) {
		window.localStorage.removeItem(this._prefix + key);
	}

	/**
	 * @return {boolean}
	 */
	static isSupported() {
		return !!window.localStorage;
	}
}
