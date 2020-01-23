/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @param {string} url
 * @param {Object} query
 * @return {string}
 */
export const buildQueryString = (url, query) => {
	const encodedParams = encodeParams(query);
	let result = url;
	if (encodedParams) {
		const delimiter = result.indexOf('?') !== -1 ? '&' : '?';
		result = result + delimiter + encodedParams;
	}

	return result;
};


/**
 * @param {Object} params
 * @return {string}
 */
export const encodeParams = (params) => {
	let i;
	const parts = [];
	for (i in params) {
		if (params.hasOwnProperty(i)) {
			const param = params[i];
			if (typeof param === 'undefined') {
				continue;
			}
			if (Array.isArray(param)) {
				for (let j = 0; j < param.length; j++) {
					parts.push(`${encodeURIComponent(i)}[]=${encodeURIComponent(param[j])}`);
				}
			} else {
				parts.push(`${encodeURIComponent(i)}=${encodeURIComponent(param)}`);
			}
		}
	}

	return parts.join('&').replace(/%20/g, '+');
};


/**
 * @param {string} queryString
 * @return {Object<string, (?string|Array<?string>)>}
 */
export const decodeParams = (queryString) => {
	if (queryString.length === 0) {
		return {};
	}

	return queryString.split('&').reduce((accumulator, param) => {
		const pair = param.split('=');

		const name = decodeURIComponent(pair[0]);
		const value = pair[1] ? decodeURIComponent(pair[1]) : '';

		if (name.slice(-2) === '[]') {
			if (!accumulator[name]) {
				accumulator[name] = [];
			}
			accumulator[name].push(value);
		} else {
			accumulator[name] = value;
		}

		return accumulator;
	}, {});
};


/**
 * @param {string} variableName
 * @return {?string|Array<?string>|undefined}
 */
export const getQueryVariable = (variableName) => {
	const query = window.location.search.substring(1);

	return decodeParams(query)[variableName];
};


/**
 * @param {Method} method
 * @return {boolean}
 */
export const shouldMethodSendData = (method) => [
	Method.POST,
	Method.PUT,
	Method.PATCH
].indexOf(method) !== -1;


/**
 * @enum {string}
 */
export const Method = {
	OPTIONS: 'OPTIONS',
	GET: 'GET',
	HEAD: 'HEAD',
	POST: 'POST',
	DELETE: 'DELETE',
	PUT: 'PUT',
	PATCH: 'PATCH',
	TRACE: 'TRACE',
	CONNECT: 'CONNECT'
};
