/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {encodeParams, shouldMethodSendData, buildQueryString, Method} from './http';


/**
 * @param {string} url
 * @param {SendingOptions=} options
 * @return {Promise<XMLHttpRequest>}
 */
export const send = (url, options = {}) => {
	const method = options.method || Method.GET;
	const timeout = options.timeout || DEFAULT_TIMEOUT;
	const builtUrl = options.query ? buildQueryString(url, options.query) : url;
	const hasBody = typeof options.body !== 'undefined';

	return new Promise((resolve, reject) => {
		if (hasBody && !shouldMethodSendData(method)) {
			throw new TypeError(`HTTP method ${options.method} should not have body`);
		}

		const xhr = new XMLHttpRequest();
		const timeoutId = setTimeout(xhr.abort.bind(xhr), timeout);

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) { // Request completed
				clearTimeout(timeoutId);
				if (xhr.status >= 200 && xhr.status <= 299) {
					resolve(xhr);
				} else {
					reject(xhr);
				}
			}
		};

		xhr.open(method, builtUrl, true);

		if (options.headers) {
			Object.keys(options.headers)
				.forEach((key) => xhr.setRequestHeader(key, options.headers[key]));
		}

		let encodedBody = null;

		if (hasBody) {
			if (typeof options.body === 'object') {
				const contentType = options.headers && options.headers['Content-Type'];

				if (contentType === 'application/json') {
					encodedBody = JSON.stringify(options.body);
				} else if (contentType === 'application/x-www-form-urlencoded') {
					encodedBody = encodeParams(options.body);
				}
			}

			if (!encodedBody) {
				encodedBody = String(options.body);
			}
		}

		xhr.send(encodedBody);
	});
};


/**
 * @typedef {{
 *     method: (Method|undefined),
 *     headers: (Object|undefined),
 *     query: (Object|undefined),
 *     body: (Object|string|undefined),
 *     timeout: (number|undefined)
 * }}
 */
export let SendingOptions;


/**
 * @type {number}
 */
export const DEFAULT_TIMEOUT = 15 * 1000;
