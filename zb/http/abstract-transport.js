/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import app from 'generated/app';


/**
 * @template REQUEST_PARAMS
 * @abstract
 */
export default class AbstractTransport {
	/**
	 */
	constructor() {
		/**
		 * @type {string}
		 * @protected
		 */
		this._baseUrl = '';

		/**
		 * @type {function(Error, REQUEST_PARAMS): Promise<HandleCode>}
		 * @protected
		 */
		this._transportErrorHandler;

		this.setTransportErrorHandler(this.defaultTransportErrorHandler.bind(this));
	}

	/**
	 * @param {function(Error, REQUEST_PARAMS): Promise<HandleCode>} handler
	 */
	setTransportErrorHandler(handler) {
		this._transportErrorHandler = handler;
	}

	/**
	 * @param {string} url
	 */
	setBaseUrl(url) {
		this._baseUrl = url;
	}

	/**
	 * @return {string} baseUrl
	 */
	getBaseUrl() {
		return this._baseUrl;
	}

	/**
	 * @return {Promise<HandleCode>}
	 */
	defaultTransportErrorHandler() {
		return Promise.resolve(HandleCode.ABORT);
	}

	/**
	 * Does the Same as overridden doRequest
	 * @param {REQUEST_PARAMS} params
	 * @return {Promise}
	 */
	doPersistentRequest(params) {
		return this._persistRequest((params) => this.doRequest(params), params, this._transportErrorHandler);
	}

	/**
	 * API defines type of arguments
	 * @abstract
	 * @param {REQUEST_PARAMS} params
	 * @return {Promise}
	 */
	doRequest(params) {}

	/**
	 * @param {function(REQUEST_PARAMS): Promise} request
	 * @param {REQUEST_PARAMS} requestParams
	 * @param {function(Error, REQUEST_PARAMS): Promise<HandleCode>} errorHandler
	 * @return {Promise}
	 * @protected
	 */
	_persistRequest(request, requestParams, errorHandler) {
		return new Promise((resolve, reject) => {
			const code = HandleCode;

			const onFail = (error) => errorHandler(error, requestParams)
				.then((reason) => {
					switch (reason) {
						case code.RETRY:
							request(requestParams).then(resolve, onFail);
							break;
						case code.ABORT:
							reject(error);
							break;
						case code.EXIT:
							app.exit();
							break;
					}
				});

			request(requestParams).then(resolve, onFail);
		});
	}
}


/**
 * @enum {string}
 */
export const HandleCode = {
	RETRY: 'retry',
	ABORT: 'abort',
	EXIT: 'exit'
};
