/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number=} opt_probability
 * @return {boolean}
 */
export const bool = (opt_probability) => Math.random() > (opt_probability || 0.5);


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const number = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} opt_maxLength
 * @return {Array}
 */
export const array = (length, opt_maxLength) => {
	let calculatedLength = length;
	if (opt_maxLength) {
		calculatedLength = number(length, opt_maxLength);
	}

	return Array(...new Array(calculatedLength));
};


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} opt_maxLength
 * @return {string}
 */
export const string = (length, opt_maxLength) => {
	let calculatedLength = length;
	if (opt_maxLength) {
		calculatedLength = number(length, opt_maxLength);
	}

	const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
	let str = '';
	let index;

	for (let i = 0; i < calculatedLength; i++) {
		index = number(0, chars.length - 1);
		str += chars[index];
	}

	return str;
};


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} opt_maxLength
 * @return {string}
 */
export const lorem = (length, opt_maxLength) => {
	let calculatedLength = length;
	if (opt_maxLength) {
		calculatedLength = number(length, opt_maxLength);
	}

	const chunk = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
		'Nunc lobortis in sapien nec sodales. Integer quis tortor dictum, aliquet arcu quis, dignissim neque. ' +
		'Proin at tellus nibh. Quisque mollis quis velit quis viverra. ' +
		'Phasellus at tortor ac est lobortis dictum ac in sapien. ' +
		'Phasellus id augue tempor, tristique ex vel, fringilla ante. ' +
		'Nulla tortor ex, tempor at bibendum eget, pellentesque vel lacus. ' +
		'Nam molestie felis sed eros gravida, in vulputate turpis interdum. ' +
		'Morbi a laoreet urna, eget feugiat elit. Nulla quam elit, rutrum quis luctus a, posuere vitae sapien.';
	let str = '';

	while (str.length < calculatedLength) {
		str += chunk;
	}

	str = str.substr(0, calculatedLength);

	return str;
};


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} width
 * @param {number} height
 * @param {string=} opt_text
 * @return {string}
 */
export const image = (width, height, opt_text) => `http://placehold.it/${width}x${height}&text=${opt_text || ''}`;
