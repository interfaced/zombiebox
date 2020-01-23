/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Axis from './axis';
import Point from './point';


/**
 */
export default class Scale {
	/**
	 */
	constructor() {
		/**
		 * @type {Point}
		 * @protected
		 */
		this._unit;

		/**
		 * @type {Point}
		 * @protected
		 */
		this._space;

		// Init data
		const Point = Point;
		this.setUnit(Point.createOneOnePoint());
		this.setSpace(Point.createZeroPoint());
	}

	/**
	 * @param {Point} point
	 * @return {Point}
	 */
	calculateRange(point) {
		return point.scale(this.getBlock());
	}

	/**
	 * @param {Point} point
	 * @return {Point}
	 */
	calculateSize(point) {
		const Axis = Axis;

		const x = this.calculateAxisSize(Axis.X, point.x);
		const y = this.calculateAxisSize(Axis.Y, point.y);

		return Point.createByNumbers(x, y);
	}

	/**
	 * @param {Axis} axis
	 * @param {number} value
	 * @return {number}
	 */
	calculateAxisRange(axis, value) {
		return value * this.getAxisBlock(axis);
	}

	/**
	 * @param {Axis} axis
	 * @param {number} value
	 * @return {number}
	 */
	calculateAxisSize(axis, value) {
		const size = this.calculateAxisRange(axis, value) - this.getSpace().getAxisValue(axis);

		return (size > 0) ? size : 0;
	}

	/**
	 * @return {Point}
	 */
	getUnit() {
		return this._unit;
	}

	/**
	 * @param {Point} point
	 */
	setUnit(point) {
		this._unit = point;
	}

	/**
	 * @return {Point}
	 */
	getSpace() {
		return this._space;
	}

	/**
	 * @param {Point} point
	 */
	setSpace(point) {
		this._space = point;
	}

	/**
	 * @param {Array<Structure>} values [axis => value]
	 */
	setValues(values) {
		const Axis = Axis;
		[Axis.X, Axis.Y].forEach((axis) => {
			this.setAxisValue(axis, values[axis]);
		});
	}

	/**
	 * @return {Array<Structure>} values [axis => value]
	 */
	getValues() {
		const Axis = Axis;
		const values = [];
		[Axis.X, Axis.Y].forEach((axis) => {
			values[axis] = this.getAxisValue(axis);
		});

		return values;
	}

	/**
	 * @param {Axis} axis
	 * @param {Structure} linear
	 */
	setAxisValue(axis, linear) {
		this._unit.setAxisValue(axis, linear.unit);
		this._space.setAxisValue(axis, linear.space);
	}

	/**
	 * @param {Axis} axis
	 * @return {Structure}
	 */
	getAxisValue(axis) {
		return {
			unit: this._unit.getAxisValue(axis),
			space: this._space.getAxisValue(axis)
		};
	}

	/**
	 * @return {Point} unit + space
	 */
	getBlock() {
		return this.getUnit().add(this.getSpace());
	}

	/**
	 * @param {Axis} axis
	 * @return {number} unit + space
	 */
	getAxisBlock(axis) {
		return this.getBlock().getAxisValue(axis);
	}
}


/**
 * @return {Scale}
 */
export const create = () => new Scale();


/**
 * @param {Point} unit
 * @param {Point} space
 * @return {Scale}
 */
export const createByPoints = (unit, space) => {
	const scale = new Scale();
	scale.setUnit(unit);
	scale.setSpace(space);

	return scale;
};


/**
 * @param {Array<Structure>} values [axis => value]
 * @return {Scale}
 */
export const createByValues = (values) => {
	const scale = new Scale();
	scale.setValues(values);

	return scale;
};


/**
 * @param {Structure} value
 * @return {Scale}
 */
export const createSquare = (value) => {
	const scale = new Scale();
	scale.setAxisValue(Axis.X, value);
	scale.setAxisValue(Axis.Y, value);

	return scale;
};


/**
 * @return {Scale}
 */
export const createOneToOne = () => createSquare({
	unit: 1,
	space: 0
});


/**
 * @typedef {{
 *     unit: number,
 *     space: number
 * }}
 */
export let Structure;
