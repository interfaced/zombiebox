/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import * as random from './structures/data/random';

/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number=} probability
 * @return {boolean}
 */
export const bool = (probability = 0.5) => random.bool(probability);


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const num = (min, max) => random.num(min, max);


/**
 * @deprecated Use num() instead.
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
export const number = (min, max) => num(min, max);


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} maxLength
 * @return {Array}
 */
export const array = (length, maxLength = length) => random.array(length, maxLength);


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} maxLength
 * @return {string}
 */
export const str = (length, maxLength = length) => random.str(length, maxLength);


/**
 * @deprecated Use str() instead.
 * @param {number} length
 * @param {number=} maxLength
 * @return {string}
 */
export const string = (length, maxLength = length) => str(length, maxLength);


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} length
 * @param {number=} maxLength
 * @return {string}
 */
export const lorem = (length, maxLength = length) => {
	const chunk = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
		'Nunc lobortis in sapien nec sodales. Integer quis tortor dictum, aliquet arcu quis, dignissim neque. ' +
		'Proin at tellus nibh. Quisque mollis quis velit quis viverra. ' +
		'Phasellus at tortor ac est lobortis dictum ac in sapien. ' +
		'Phasellus id augue tempor, tristique ex vel, fringilla ante. ' +
		'Nulla tortor ex, tempor at bibendum eget, pellentesque vel lacus. ' +
		'Nam molestie felis sed eros gravida, in vulputate turpis interdum. ' +
		'Morbi a laoreet urna, eget feugiat elit. Nulla quam elit, rutrum quis luctus a, posuere vitae sapien.';

	const len = random.num(length, maxLength);
	const count = Math.ceil(len / chunk.length);
	return chunk.repeat(count).substr(0, len);
};


/**
 * @deprecated You should use the real data instead. But don`t delete stub from zombiebox.
 * @param {number} width
 * @param {number} height
 * @param {string=} text
 * @return {string}
 */
export const image = (width, height, text = '') => `http://placehold.it/${width}x${height}&text=${text}`;
