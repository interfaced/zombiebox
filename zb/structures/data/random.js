/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @param {number=} probability
 * @return {boolean}
 */
export const bool = (probability = 0.5) => Math.random() < probability;


/**
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const num = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


/**
 * @param {number} length
 * @param {number=} maxLength
 * @return {Array}
 */
export const array = (length, maxLength = length) => Array.from(new Array(num(length, maxLength)));


/**
 * @template T
 * @param {IArrayLike<T>|string} source
 * @return {T|string}
 */
export const item = (source) => source[num(0, source.length - 1)];


/**
 * @param {number} length
 * @param {number=} maxLength
 * @param {string=} alphabet
 * @return {string}
 */
export const str = (length, maxLength = length, alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz') => {
	let str = '';

	for (let i = num(length, maxLength); i--;) {
		str += item(alphabet);
	}

	return str;
};
