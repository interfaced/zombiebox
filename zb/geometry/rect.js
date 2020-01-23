/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {warn} from '../console/console';
import Axis from './axis';
import Corner from './corner';
import Direction, {Value as DirectionValue} from './direction';
import Point from './point';


/**
 */
export default class Rect {
	/**
	 * @param {Value} value
	 */
	constructor(value) {
		/**
		 * @type {number}
		 */
		this.x0;

		/**
		 * @type {number}
		 */
		this.y0;

		/**
		 * @type {number}
		 */
		this.x1;

		/**
		 * @type {number}
		 */
		this.y1;

		this.setValue(value);
	}

	/**
	 * @return {boolean}
	 */
	isEmpty() {
		return !(this.x1 > this.x0 && this.y1 > this.y0);
	}

	/**
	 * @param {Value} value
	 */
	setValue(value) {
		this.y0 = value.y0;
		this.x0 = value.x0;
		this.x1 = value.x1;
		this.y1 = value.y1;
	}

	/**
	 * @return {Value}
	 */
	getValue() {
		return {
			x0: this.x0,
			y0: this.y0,
			x1: this.x1,
			y1: this.y1
		};
	}

	/**
	 * @param {Direction} direction
	 * @return {number}
	 */
	getBorderByDirection(direction) {
		if (direction.isHorizontal()) {
			if (direction.isAscending()) {
				return this.x1;
			} else if (direction.isDescending()) {
				return this.x0;
			}
		} else if (direction.isVertical()) {
			if (direction.isAscending()) {
				return this.y1;
			} else if (direction.isDescending()) {
				return this.y0;
			}
		}

		warn(`Unknown direction: ${direction}`);

		return NaN;
	}

	/**
	 * @param {Direction} direction
	 * @param {number} value
	 */
	setBorderByDirection(direction, value) {
		if (direction.isHorizontal()) {
			if (direction.isAscending()) {
				this.x1 = value;
			} else if (direction.isDescending()) {
				this.x0 = value;
			}
		} else if (direction.isVertical()) {
			if (direction.isAscending()) {
				this.y1 = value;
			} else if (direction.isDescending()) {
				this.y0 = value;
			}
		}
	}

	/**
	 * @return {Point}
	 */
	getPointA() {
		return Point.createByValue({
			x: this.x0,
			y: this.y0
		});
	}

	/**
	 * @return {Point}
	 */
	getPointB() {
		return Point.createByValue({
			x: this.x1,
			y: this.y1
		});
	}

	/**
	 * @return {Point}
	 */
	getPointCenter() {
		return Point.createByValue({
			x: (this.x0 + this.x1) / 2,
			y: (this.y0 + this.y1) / 2
		});
	}

	/**
	 * @param {Array<Direction>} directions
	 * @return {Point}
	 */
	getPointByDirections(directions) {
		const point = Point.createZeroPoint();
		directions.forEach((dir) => {
			const axis = dir.getAxis();
			const value = this.getBorderByDirection(dir);
			point.setAxisValue(axis, value);
		});

		return point;
	}

	/**
	 * @param {Corner} corner
	 * @return {Point}
	 */
	getPointByCorner(corner) {
		return this.getPointByDirections(corner.getDirections());
	}

	/**
	 * @return {Point}
	 */
	getSize() {
		return Point.createByValue({
			x: this.x1 - this.x0,
			y: this.y1 - this.y0
		});
	}

	/**
	 * @param {Axis} axis
	 * @return {number}
	 */
	getSizeByAxis(axis) {
		return this.getSize().getAxisValue(axis);
	}

	/**
	 * @return {number}
	 */
	getSizeX() {
		return this.getSizeByAxis(Axis.X);
	}

	/**
	 * @return {number}
	 */
	getSizeY() {
		return this.getSizeByAxis(Axis.Y);
	}

	/**
	 * @param {Direction} direction
	 * @param {number} value
	 */
	cutInDirection(direction, value) {
		const oldValue = this.getBorderByDirection(direction);
		const newValue = direction.isAscending() ? Math.min(value, oldValue) : Math.max(value, oldValue);

		this.setBorderByDirection(direction, newValue);
	}

	/**
	 * @param {Direction} direction
	 */
	openInDirection(direction) {
		const newValue = direction.isAscending() ? Infinity : -Infinity;

		this.setBorderByDirection(direction, newValue);
	}

	/**
	 * @param {number} value
	 */
	cutLeft(value) {
		this.cutInDirection(Direction.createLeft(), value);
	}

	/**
	 * @param {number} value
	 */
	cutRight(value) {
		this.cutInDirection(Direction.createRight(), value);
	}

	/**
	 * @param {number} value
	 */
	cutUp(value) {
		this.cutInDirection(Direction.createUp(), value);
	}

	/**
	 * @param {number} value
	 */
	cutDown(value) {
		this.cutInDirection(Direction.createDown(), value);
	}

	/**
	 * @param {number} value
	 */
	moveX(value) {
		this.x0 = this.x0 + value;
		this.x1 = this.x1 + value;
	}

	/**
	 * @param {number} value
	 */
	moveY(value) {
		this.y0 = this.y0 + value;
		this.y1 = this.y1 + value;
	}

	/**
	 * @param {Point} point
	 */
	moveXY(point) {
		this.x0 = this.x0 + point.x;
		this.y0 = this.y0 + point.y;
		this.x1 = this.x1 + point.x;
		this.y1 = this.y1 + point.y;
	}

	/**
	 * @param {Point} point
	 */
	moveTo(point) {
		const width = this.x1 - this.x0;
		const height = this.y1 - this.y0;
		this.x0 = point.x;
		this.y0 = point.y;
		this.x1 = point.x + width;
		this.y1 = point.y + height;
	}

	/**
	 * @param {number} value
	 */
	extendEvenly(value) {
		this.x0 = this.x0 - value;
		this.y0 = this.y0 - value;
		this.x1 = this.x1 + value;
		this.y1 = this.y1 + value;
	}

	/**
	 */
	shrinkDelta() {
		const d = 0.001;
		this.extendEvenly(-d);
	}

	/**
	 * @return {Rect}
	 */
	clone() {
		return Rect.create(this.getValue());
	}

	/**
	 * @param {Rect} rectB
	 * @return {boolean}
	 */
	isEqual(rectB) {
		const rectA = this;

		return (
			rectA.x0 === rectB.x0 &&
			rectA.y0 === rectB.y0 &&
			rectA.x1 === rectB.x1 &&
			rectA.y1 === rectB.y1
		);
	}

	/**
	 * @param {Point} point
	 * @return {boolean}
	 */
	hasPoint(point) {
		return (
			this.x0 <= point.x &&
			this.x1 > point.x &&
			this.y0 <= point.y &&
			this.y1 > point.y
		);
	}

	/**
	 * @param {Rect} b
	 * @return {Rect}
	 */
	getIntersection(b) {
		const a = this;

		return Rect.create({
			x0: Math.max(a.x0, b.x0),
			y0: Math.max(a.y0, b.y0),
			x1: Math.min(a.x1, b.x1),
			y1: Math.min(a.y1, b.y1)
		});
	}

	/**
	 * @param {Rect} b
	 * @return {boolean}
	 */
	isIntersects(b) {
		return this.x0 < b.x1 && this.x1 > b.x0 && this.y0 < b.y1 && this.y1 > b.y0;
	}

	/**
	 * @param {Rect} b
	 * @return {boolean}
	 */
	isIntersectsGeometric(b) {
		return this.x0 <= b.x1 && this.x1 >= b.x0 && this.y0 <= b.y1 && this.y1 >= b.y0;
	}

	/**
	 * @param {Rect} external
	 * @return {!Object<DirectionValue, number>}
	 */
	getOverflowAll(external) {
		const internal = this;
		const overflow = {};

		Direction.createAll()
			.forEach((dir) => {
				overflow[dir.getKey()] = dir.getSign() * (
					internal.getBorderByDirection(dir) - external.getBorderByDirection(dir)
				);
			});

		return overflow;
	}

	/**
	 * @param {Rect} external
	 * @return {Object<DirectionValue, number>}
	 */
	getPositiveOverflowAll(external) {
		const overflow = this.getOverflowAll(external);
		const poverflow = /** @type {Object<DirectionValue, number>} */ ({});
		Object.keys(overflow)
			.forEach((dirname) => {
				const typedDirname = /** @type {DirectionValue} */ (dirname);
				poverflow[typedDirname] = overflow[typedDirname] > 0 ? overflow[typedDirname] : 0;
			});

		return poverflow;
	}

	/**
	 * @param {Rect} external
	 * @return {Object<DirectionValue, boolean>}
	 */
	isOverflowReachedAll(external) {
		const overflow = this.getOverflowAll(external);
		const reached = /** @type {Object<DirectionValue, boolean>} */ ({});

		Object.keys(overflow)
			.forEach((dirname) => {
				const typedDirname = /** @type {DirectionValue} */ (dirname);
				reached[typedDirname] = overflow[typedDirname] >= 0;
			});

		return reached;
	}

	/**
	 * @param {Rect} external
	 * @param {Direction} direction
	 * @return {number}
	 */
	getOverflowInDirection(external, direction) {
		return direction.getSign() * (this.getBorderByDirection(direction) - external.getBorderByDirection(direction));
	}

	/**
	 * @param {Rect} external
	 * @param {Direction} direction
	 * @return {boolean}
	 */
	isOverflowReachedInDirection(external, direction) {
		return this.getOverflowInDirection(external, direction) >= 0;
	}

	/**
	 * @param {Rect} rectB
	 * @return {Array<Rect>}
	 */
	sub(rectB) {
		const rectA = this;

		// Case: IRRELATIVE Rectangles
		if (!rectA.isIntersects(rectB)) {
			return [rectA.clone()];
		}

		let result = [];

		// LEFT, RIGHT
		[Direction.createLeft(), Direction.createRight()].forEach((dirX) => {
			const rect = rectA.clone();
			rect.cutInDirection(dirX.invert(), rectB.getBorderByDirection(dirX));
			[Direction.createUp(), Direction.createDown()].forEach((dirY) => {
				rect.cutInDirection(dirY, rectB.getBorderByDirection(dirY));
			});
			result.push(rect);
		});

		// TOP, BOTTOM
		[Direction.createUp(), Direction.createDown()].forEach((dirY) => {
			const rect = rectA.clone();
			rect.cutInDirection(dirY.invert(), rectB.getBorderByDirection(dirY));
			result.push(rect);
		});

		result = result.filter((rect) => !rect.isEmpty());

		return result;
	}

	/**
	 * @param {Rect} rectB
	 * @return {Rect}
	 */
	extrapolateWith(rectB) {
		const rectA = this;

		return Rect.create({
			x0: Math.min(rectA.x0, rectB.x0),
			y0: Math.min(rectA.y0, rectB.y0),
			x1: Math.max(rectA.x1, rectB.x1),
			y1: Math.max(rectA.y1, rectB.y1)
		});
	}

	/**
	 * @param {Point} step
	 * @return {Array<Point>}
	 */
	splitToPoints(step) {
		const points = [];
		const rect = this;
		for (let x = rect.x0; x < rect.x1; x += step.x) {
			for (let y = rect.y0; y < rect.y1; y += step.y) {
				points.push(Point.createByValue({
					x,
					y
				}));
			}
		}

		return points;
	}

	/**
	 * @param {Point} pageSize
	 * @return {Rect}
	 */
	page(pageSize) {
		const p0 = this.getPointA().floorPage(pageSize);
		const p1 = this.getPointB().ceilPage(pageSize);

		return Rect.createByPoints(p0, p1);
	}

	/**
	 * @param {Point} pageSize
	 * @return {Rect}
	 */
	scale(pageSize) {
		return Rect.create({
			x0: this.x0 * pageSize.x,
			y0: this.y0 * pageSize.y,
			x1: this.x1 * pageSize.x,
			y1: this.y1 * pageSize.y
		});
	}

	/**
	 * @return {string}
	 */
	toString() {
		return `${this.getPointA()} - ${this.getPointB()}`;
	}

	/**
	 * @param {number} x0
	 * @param {number} y0
	 * @param {number} x1
	 * @param {number} y1
	 * @return {Rect}
	 */
	static createByNumbers(x0, y0, x1, y1) {
		return new Rect({
			x0,
			y0,
			x1,
			y1
		});
	}

	/**
	 * @param {Point} size
	 * @param {Point=} point
	 * @return {Rect}
	 */
	static createBySize(size, point = Point.createZeroPoint()) {
		return new Rect({
			x0: point.x,
			y0: point.y,
			x1: point.x + size.x,
			y1: point.y + size.y
		});
	}

	/**
	 * @param {Point} p0
	 * @param {Point} p1
	 * @return {Rect}
	 */
	static createByPoints(p0, p1) {
		return new Rect({
			x0: p0.x,
			y0: p0.y,
			x1: p1.x,
			y1: p1.y
		});
	}

	/**
	 * @param {ClientRect} client
	 * @return {Rect}
	 */
	static createByClientRect(client) {
		const rect = Rect.createEmptyRect();
		rect.setBorderByDirection(Direction.createLeft(), client.left);
		rect.setBorderByDirection(Direction.createRight(), client.left + client.width);
		rect.setBorderByDirection(Direction.createUp(), client.top);
		rect.setBorderByDirection(Direction.createDown(), client.top + client.height);

		return rect;
	}

	/**
	 * @param {Value} value
	 * @return {Rect}
	 */
	static create(value) {
		return new Rect(value);
	}

	/**
	 * @return {Rect}
	 */
	static createEmptyRect() {
		return Rect.create({x0: 0, y0: 0, x1: 0, y1: 0});
	}

	/**
	 * @param {Point=} position
	 * @return {Rect}
	 */
	static createOneUnitRect(position = new Point(0, 0)) {
		return Rect.create({
			x0: position.x,
			y0: position.y,
			x1: position.x + 1,
			y1: position.y + 1
		});
	}

	/**
	 * @return {Rect}
	 */
	static createInfiniteRect() {
		return Rect.create({x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity});
	}

	/**
	 * @param {number} y0
	 * @param {number} y1
	 * @return {Rect}
	 */
	static createHorizontalInfiniteRect(y0, y1) {
		return Rect.create({x0: -Infinity, y0, x1: Infinity, y1});
	}

	/**
	 * @param {number} x0
	 * @param {number} x1
	 * @return {Rect}
	 */
	static createVerticalInfiniteRect(x0, x1) {
		return Rect.create({x0, y0: -Infinity, x1, y1: Infinity});
	}
}


/**
 * @typedef {{
 *     x0: number,
 *     y0: number,
 *     x1: number,
 *     y1: number
 * }}
 */
export let Value;
