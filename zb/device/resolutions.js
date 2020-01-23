/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Rect from '../geometry/rect';


/**
 * @enum {number}
 */
export const Resolution = {
	HD: 2,
	FULL_HD: 3,
	UHD_4K: 4,
	UHD_8K: 5
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
	[Resolution.HD]: {
		name: 'hd',
		width: 1280,
		height: 720
	},

	[Resolution.FULL_HD]: {
		name: 'full-hd',
		width: 1920,
		height: 1080
	},

	[Resolution.UHD_4K]: {
		name: '4k',
		width: 3840,
		height: 2160
	},

	[Resolution.UHD_8K]: {
		name: '4k',
		width: 7680,
		height: 4320
	}
};


/**
 * @param {Rect} rect
 * @return {Resolution}
 */
export const findLargest = (rect) => {
	const size = rect.getSize();

	return Object.values(Resolution)
		.filter((resolution) => {
			const info = ResolutionInfo[resolution];
			return info.width <= size.x && info.height <= size.y;
		})
		.sort((a, b) => {
			const aInfo = ResolutionInfo[a];
			const bInfo = ResolutionInfo[b];

			if (aInfo.width === bInfo.width) {
				return bInfo.height - aInfo.height;
			}

			return bInfo.width - aInfo.width;
		})
		.shift() || null;
};

/**
 * @param {Rect} rect
 * @param {ResolutionInfoItem} from
 * @param {ResolutionInfoItem} to
 * @param {function(number): number} round
 * @return {Rect}
 */
export const translate = (rect, from, to, round = Math.round) => {
	const widthScale = to.width / from.width;
	const heightScale = to.height / from.height;

	return new Rect({
		x0: round(rect.x0 * widthScale),
		y0: round(rect.y0 * heightScale),
		x1: round(rect.x1 * widthScale),
		y1: round(rect.y1 * heightScale)
	});
};

/**
 * @param {ResolutionInfoItem} info
 * @return {Rect}
 */
export const createResolutionRect = (info) => new Rect({
	x0: 0,
	y0: 0,
	x1: info.width,
	y1: info.height
});
