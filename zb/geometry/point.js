/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Axis from './axis';
import Direction from './direction';


/**
 */
export default class Point {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		/**
		 * @type {number}
		 */
		this.x = x;

		/**
		 * @type {number}
		 */
		this.y = y;
	}

	/**
	 * @param {Axis} axis
	 * @param {number} value
	 */
	setAxisValue(axis, value) {
		const a = Axis;
		if (axis === a.X) {
			this.x = value;
		} else if (axis === a.Y) {
			this.y = value;
		}
	}

	/**
	 * @param {Axis} axis
	 * @return {number} value
	 */
	getAxisValue(axis) {
		const a = Axis;
		if (axis === a.X) {
			return this.x;
		} else if (axis === a.Y) {
			return this.y;
		}

		return NaN;
	}

	/**
	 * @return {Value}
	 */
	getValue() {
		return {
			x: this.x,
			y: this.y
		};
	}

	/**
	 * Calculate euclidean distance
	 * @param {Point} point
	 * @return {number}
	 */
	getDistance(point) {
		return Math.sqrt(
			Math.abs(this.x - point.x) ** 2 +
			Math.abs(this.y - point.y) ** 2
		);
	}

	/**
	 * @param {Axis} axis
	 * @param {number} value
	 */
	moveByAxis(axis, value) {
		this.setAxisValue(axis, this.getAxisValue(axis) + value);
	}

	/**
	 * @param {Direction} direction
	 * @param {number} value
	 */
	moveInDirection(direction, value) {
		const axis = direction.getAxis();
		const sign = direction.getSign();

		this.moveByAxis(axis, sign * value);
	}

	/**
	 * @param {number} dx
	 * @param {number} dy
	 */
	moveXY(dx, dy) {
		this.x = this.x + dx;
		this.y = this.y + dy;
	}

	/**
	 * @return {Point}
	 */
	clone() {
		return Point.createByValue(this.getValue());
	}

	/**
	 * @return {Point}
	 */
	invertPoint() {
		return Point.createByValue({
			x: -this.x,
			y: -this.y
		});
	}

	/**
	 * @param {Point} b
	 * @return {Point}
	 */
	add(b) {
		return Point.createByValue({
			x: this.x + b.x,
			y: this.y + b.y
		});
	}

	/**
	 * @param {Point} b
	 * @return {Point}
	 */
	sub(b) {
		return Point.createByValue({
			x: this.x - b.x,
			y: this.y - b.y
		});
	}

	/**
	 * @param {Point} page
	 * @return {Point}
	 */
	floorPage(page) {
		return Point.createByValue({
			x: Math.floor(this.x / page.x),
			y: Math.floor(this.y / page.y)
		});
	}

	/**
	 * @param {Point} page
	 * @return {Point}
	 */
	ceilPage(page) {
		return Point.createByValue({
			x: Math.ceil(this.x / page.x),
			y: Math.ceil(this.y / page.y)
		});
	}

	/**
	 * @param {Point} page
	 * @return {Point}
	 */
	modPage(page) {
		return Point.createByValue({
			x: this.x % page.x,
			y: this.y % page.y
		});
	}

	/**
	 * @param {Point} page
	 * @return {Point}
	 */
	page(page) {
		return this.floorPage(page);
	}

	/**
	 * @param {Point} page
	 * @return {Point}
	 */
	scale(page) {
		return Point.createByValue({
			x: this.x * page.x,
			y: this.y * page.y
		});
	}

	/**
	 * @param {Axis} axis
	 * @param {number} value
	 * @return {Point}
	 */
	scaleAxis(axis, value) {
		const scaled = this.clone();
		scaled.setAxisValue(axis, this.getAxisValue(axis) * value);

		return scaled;
	}

	/**
	 * @return {string}
	 */
	toString() {
		return `${this.x}:${this.y}`;
	}

	/**
	 * @param {Value} value
	 * @return {Point}
	 */
	static createByValue(value) {
		return new Point(value.x, value.y);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {Point}
	 */
	static createByNumbers(x, y) {
		return new Point(x, y);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @return {Point}
	 */
	static create(x, y) {
		return Point.createByNumbers(x, y);
	}

	/**
	 * @return {Point}
	 */
	static createZeroPoint() {
		return Point.createByValue({x: 0, y: 0});
	}

	/**
	 * @return {Point}
	 */
	static createOneOnePoint() {
		return Point.createByValue({x: 1, y: 1});
	}
}


/**
 * @typedef {{
 *     x: number,
 *     y: number
 * }}
 */
export let Value;
