/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @enum {number}
 */
export const Resolution = {
	QHD: 1,
	HD: 2,
	FULL_HD: 3
};


/**
 * @typedef {{
 *     name: string,
 *     width: number,
 *     height: number
 * }}
 */
export let ResolutionInfoItem;


/**
 * @type {Object<Resolution, ResolutionInfoItem>}
 */
export const ResolutionInfo = {
	[Resolution.QHD]: {
		name: 'qhd',
		width: 960,
		height: 540
	},

	[Resolution.HD]: {
		name: 'hd',
		width: 1280,
		height: 720
	},

	[Resolution.FULL_HD]: {
		name: 'full-hd',
		width: 1920,
		height: 1080
	}
};
