/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Rect, {Value as RectValue} from './rect';


/**
 */
export default class Area {
	/**
	 * @param {Value} value
	 */
	constructor(value) {
		/**
		 * @type {Value}
		 */
		this.value = value;
	}

	/**
	 * @return {Value}
	 */
	getValue() {
		return this.value;
	}

	/**
	 * @return {boolean}
	 */
	isEmpty() {
		return this.getValue().every((rect) => rect.isEmpty());
	}

	/**
	 * @return {Rect}
	 */
	extrapolate() {
		const rects = this.getValue();
		if (!rects.length) {
			return Rect.createEmptyRect();
		}

		const config = rects.reduce((prev, next) => ({
			x0: Math.min(prev.x0, next.x0),
			y0: Math.min(prev.y0, next.y0),
			x1: Math.max(prev.x1, next.x1),
			y1: Math.max(prev.y1, next.y1)
		}));

		return Rect.create(/** @type {RectValue} **/ (config));
	}

	/**
	 * @param {Value} value
	 * @return {Area}
	 */
	static create(value) {
		return new Area(value);
	}
}


/**
 * @typedef {Array<Rect>}
 */
export let Value;
