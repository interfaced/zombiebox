/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @deprecated – Use default browser Promise implementation
 * @template TYPE
 */
class CustomPromise {
	/**
	 * @deprecated – Use default browser Promise implementation
	 * @param {function(
	 *     function((TYPE|Promise<TYPE>)),
	 *     function(*)
	 * )} resolver
	 */
	constructor(resolver) {
		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isCanceled = false;

		/**
		 * @type {Promise}
		 * @protected
		 */
		this._promise = new Promise((resolve, reject) => {
			resolver(
				(result) => {
					if (!this._isCanceled) {
						resolve(result);
					}
				},
				(error) => {
					if (!this._isCanceled) {
						reject(error);
					}
				}
			);
		});
	}

	/**
	 * @deprecated – Use default browser Promise implementation
	 * @override
	 * @return {!Promise<TYPE>}
	 */
	then(onResolved, onRejected) {
		return Promise.wrap(this._promise.then(onResolved, onRejected));
	}

	/**
	 * @deprecated – Use default browser Promise implementation
	 * Cancel promise fulfilling
	 */
	cancel() {
		this._isCanceled = true;
	}

	/**
	 * @deprecated – Use default browser Promise implementation
	 * @param {function(*): *} resolveOrReject
	 * @return {!Promise}
	 */
	always(resolveOrReject) {
		return Promise.wrap(always(this, resolveOrReject));
	}

	/**
	 * @deprecated – Use default browser Promise implementation
	 * @param {Promise} promise
	 * @return {!Promise}
	 */
	static wrap(promise) {
		return new Promise((resolve, reject) => {
			promise.then(resolve, reject);
		});
	}
}


/**
 * @deprecated – Use default browser Promise implementation
 * @param {Promise} promise
 * @param {function(*): *} callback
 * @return {Promise}
 */
export const always = (promise, callback) => promise.then(callback, callback);


/**
 * @deprecated – Use default browser Promise implementation
 * @param {Array<Promise>|Object<string, Promise|*>} promises
 * @return {Promise}
 */
export const all = (promises) => {
	if (Array.isArray(promises)) {
		return Promise['all'](promises);
	}

	if (!(promises instanceof Object)) {
		return Promise['all']();
	}

	const keys = Object.keys(/** @type {!Object} */ (promises));
	const arr = keys.map((key) => promises[key]);

	return Promise['all'](arr)
		.then((results) => {
			const obj = {};
			results.forEach((val, i) => {
				obj[keys[i]] = val;
			});

			return obj;
		});
};


/**
 * @deprecated – Use default browser Promise implementation
 */
export const Promise = CustomPromise;
