/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
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
	const result = {};

	const vars = queryString.split('&');
	for (let i = 0; i < vars.length; i++) {
		const pair = vars[i].split('=');

		const variableName = decodeURIComponent(pair[0]);
		const variableValue = pair[1] ? decodeURIComponent(pair[1]) : '';

		if (variableName.slice(-2) === '[]') {
			if (!result[variableName]) {
				result[variableName] = [];
			}
			result[variableName].push(variableValue);
		} else {
			result[variableName] = variableValue;
		}
	}

	return result;
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
