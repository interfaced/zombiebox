/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Axis from './axis';
import Direction, {Sign} from './direction';


/**
 */
export default class Corner {
	/**
	 * @param {Array<Sign>} signs
	 */
	constructor(signs) {
		/**
		 * @type {Array<Sign>}
		 * @protected
		 */
		this._signs;

		this.setSigns(signs);
	}

	/**
	 * @param {Axis} axis
	 * @return {Direction}
	 */
	getDirectionByAxis(axis) {
		const sign = this.getSignByAxis(axis);

		return Direction.createByCode(sign * (axis + 1));
	}

	/**
	 * @param {Axis} axis
	 * @return {Sign}
	 */
	getSignByAxis(axis) {
		const signs = this.getSigns();

		return signs[axis];
	}

	/**
	 * @return {Array<Direction>}
	 */
	getDirections() {
		return this.getSigns()
			.map((sign, axis) => Direction.createByCode(sign * (axis + 1)));
	}

	/**
	 * @return {Array<Sign>}
	 */
	getSigns() {
		return this._signs;
	}

	/**
	 * @param {Array<Sign>} signs
	 */
	setSigns(signs) {
		this._signs = signs;
	}

	/**
	 * @param {Array<Sign>} signs
	 * @return {Corner}
	 */
	static createBySigns(signs) {
		return new Corner(signs);
	}

	/**
	 * @param {Array<Direction>} directions
	 * @return {Corner}
	 */
	static createByDirections(directions) {
		const signs = [];
		directions.forEach((dir) => {
			signs[dir.getAxis()] = dir.getSign();
		});

		return Corner.createBySigns(signs);
	}

	/**
	 * @return {Corner}
	 */
	static createLeftUp() {
		return Corner.createByDirections([
			Direction.createLeft(),
			Direction.createUp()
		]);
	}

	/**
	 * @return {Corner}
	 */
	static createLeftDown() {
		return Corner.createByDirections([
			Direction.createLeft(),
			Direction.createDown()
		]);
	}

	/**
	 * @return {Corner}
	 */
	static createRightUp() {
		return Corner.createByDirections([
			Direction.createRight(),
			Direction.createUp()
		]);
	}

	/**
	 * @return {Corner}
	 */
	static createRightDown() {
		return Corner.createByDirections([
			Direction.createRight(),
			Direction.createDown()
		]);
	}
}
