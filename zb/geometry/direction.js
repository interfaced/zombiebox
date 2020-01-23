/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Axis from './axis';


/**
 */
export default class Direction {
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
	getKey() {
		return this.value;
	}

	/**
	 * @return {Code}
	 */
	getCode() {
		return Codes[this.getKey()];
	}

	/**
	 * @return {Axis}
	 */
	getAxis() {
		return /** @type {Axis} */ (Math.abs(this.getCode()) - 1);
	}

	/**
	 * @return {number} -1 or +1
	 */
	getSign() {
		const code = this.getCode();
		const sign = code / Math.abs(code);

		return sign;
	}

	/**
	 * @return {string}
	 */
	domPropertyName() {
		return PropertyNames[this.getKey()];
	}

	/**
	 * @return {boolean}
	 */
	isVertical() {
		return this.getAxis() === Axis.Y;
	}

	/**
	 * @return {boolean}
	 */
	isHorizontal() {
		return this.getAxis() === Axis.X;
	}

	/**
	 * @return {boolean}
	 */
	isAscending() {
		return this.getSign() > 0;
	}

	/**
	 * @return {boolean}
	 */
	isDescending() {
		return this.getSign() < 0;
	}

	/**
	 * @return {Direction}
	 */
	invert() {
		return Direction.createByCode(-1 * this.getCode());
	}

	/**
	 * @return {string}
	 */
	toString() {
		return this.getKey();
	}

	/**
	 * @param {Code} code
	 * @return {Direction}
	 */
	static createByCode(code) {
		let value;
		Object.keys(Codes).forEach((val) => {
			const typedVal = /** @type {Value}*/ (val);
			if (Codes[typedVal] === code) {
				value = typedVal;
			}
		});

		return new Direction(value);
	}

	/**
	 * @param {Axis} axis
	 * @param {Sign} sign
	 * @return {Direction}
	 */
	static createByAxisAndSign(axis, sign) {
		return Direction.createByCode(sign * (axis + 1));
	}

	/**
	 * @param {Value} value
	 * @return {Direction}
	 */
	static createByKey(value) {
		return new Direction(value);
	}

	/**
	 * @param {Value} value
	 * @return {Direction}
	 */
	static create(value) {
		return new Direction(value);
	}

	/**
	 * @return {Direction}
	 */
	static createLeft() {
		return Direction.createByKey(Value.LEFT);
	}

	/**
	 * @return {Direction}
	 */
	static createRight() {
		return Direction.createByKey(Value.RIGHT);
	}

	/**
	 * @return {Direction}
	 */
	static createUp() {
		return Direction.createByKey(Value.UP);
	}

	/**
	 * @return {Direction}
	 */
	static createDown() {
		return Direction.createByKey(Value.DOWN);
	}

	/**
	 * @return {Array<Direction>}
	 */
	static createAll() {
		const d = Direction;

		return [
			d.createLeft(),
			d.createRight(),
			d.createUp(),
			d.createDown()
		];
	}
}


/**
 * @enum {string}
 */
export const Value = {
	LEFT: 'left',
	RIGHT: 'right',
	UP: 'up',
	DOWN: 'down'
};


/**
 * @enum {number}
 */
export const Sign = {
	ASC: 1,
	DESC: -1
};


/**
 * Sign -1 for descending +1 for ascending * (axis code + 1)
 * @see {Codes}
 * @typedef {number}
 */
export let Code;


/**
 * @type {!Object<Value, Code>}
 */
export const Codes = {};
Codes[Value.LEFT] = -1;
Codes[Value.RIGHT] = 1;
Codes[Value.UP] = -2;
Codes[Value.DOWN] = 2;


/**
 * @type {!Object<Value, string>}
 */
export const PropertyNames = {};
PropertyNames[Value.LEFT] = 'left';
PropertyNames[Value.RIGHT] = 'right';
PropertyNames[Value.UP] = 'top';
PropertyNames[Value.DOWN] = 'bottom';
