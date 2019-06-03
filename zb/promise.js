/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @template TYPE
 * @implements {IThenable<TYPE>}
 */
export class Promise {
	/**
	 * @param {function(
	 *     function((TYPE|IThenable<TYPE>|Thenable)),
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
		 * @type {IThenable}
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
	 * @override
	 * @return {!Promise<RESULT>}
	 */
	then(opt_onResolved, opt_onRejected) {
		return Promise.wrap(this._promise.then(opt_onResolved, opt_onRejected));
	}

	/**
	 * Cancel promise fulfilling
	 */
	cancel() {
		this._isCanceled = true;
	}

	/**
	 * @param {function(*): *} resolveOrReject
	 * @return {!Promise}
	 */
	always(resolveOrReject) {
		return Promise.wrap(always(this, resolveOrReject));
	}

	/**
	 * @param {IThenable} promise
	 * @return {!Promise}
	 */
	static wrap(promise) {
		return new Promise((resolve, reject) => {
			promise.then(resolve, reject);
		});
	}
}


/**
 * @param {IThenable} promise
 * @param {function(*): *} callback
 * @return {IThenable}
 */
export const always = (promise, callback) => promise.then(callback, callback);


/**
 * @param {Array<IThenable>|Object<string, IThenable|*>} promises
 * @return {IThenable}
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
