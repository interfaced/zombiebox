/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Axis from '../../geometry/axis';
import Area from '../../geometry/area';
import Direction, {Value} from '../../geometry/direction';
import Point from '../../geometry/point';
import Rect from '../../geometry/rect';
import IWidget from '../interfaces/i-widget';
import AbstractNavigation from './abstract-navigation';


/**
 */
export default class SpatialNavigation extends AbstractNavigation {
	/**
	 * @param {boolean=} isCyclicalHorizontal
	 * @param {boolean=} isCyclicalVertical
	 */
	constructor(isCyclicalHorizontal = false, isCyclicalVertical = false) {
		super();

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isCyclicalHorizontal = false;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isCyclicalVertical = false;

		/**
		 * Default start point for spatial navigation.
		 * @type {Rect}
		 * @protected
		 */
		this._startRect = Rect.createByNumbers(0, 0, 0, 0);

		this.setCyclicalEnabled(isCyclicalHorizontal, isCyclicalVertical);
	}

	/**
	 * We move focus from this Widget
	 * @param {IWidget} fromWidget
	 * to this Widget
	 * @param {IWidget} toWidget
	 * All widgets that can be focused, excepting fromWidget and toWidget
	 * @param {Array<IWidget>} otherFocusableWidgets
	 * Direction of focusing
	 * @param {Value} direction
	 */
	visualize(fromWidget, toWidget, otherFocusableWidgets, direction) {
		const labels = [];

		const addLabeledLine = (ctx, fromRect, toRect, direction, color) => {
			this._drawRectangle(ctx, toRect, color);

			const points = getNavigationPoints(fromRect, toRect, direction);
			if (points) {
				this._drawNavigationLine(ctx, points.fromPoint, points.toPoint, color);

				labels.push(points);
			}
		};

		if (fromWidget && toWidget) {
			const ctx = this._getDebugCanvas();

			const fromRect = fromWidget.getContainerRect();
			const toRect = toWidget.getContainerRect();
			if (!fromRect || !toRect) {
				return;
			}

			this._drawRectangle(ctx, fromRect, FROM_DEBUG_COLOR);

			for (let i = 0; i < otherFocusableWidgets.length; i++) {
				otherFocusableWidgets[i].getFocusableRects()
					.forEach((rect) => {
						addLabeledLine(ctx, fromRect, rect, direction, OTHER_DEBUG_COLOR);
					});
			}

			addLabeledLine(ctx, fromRect, toRect, direction, TO_DEBUG_COLOR);

			this._drawNavigationLabels(ctx, labels);
		}
	}

	/**
	 * @param {Rect|Point} sourceRect
	 * @param {Direction=} direction
	 * @return {Array<IWidget>}
	 */
	sortWidgetsByDistance(sourceRect, direction) {
		let rect;
		if (sourceRect instanceof Point) {
			rect = Rect.createByNumbers(
				sourceRect.x,
				sourceRect.y,
				sourceRect.x + 1,
				sourceRect.y + 1
			);
		} else {
			rect = /** @type {Rect} */ (sourceRect);
		}

		return this._sortWidgetsByDistance(rect, this._widgets, direction);
	}

	/**
	 * @param {boolean=} isCyclicalHorizontal
	 * @param {boolean=} isCyclicalVertical
	 */
	setCyclicalEnabled(isCyclicalHorizontal = false, isCyclicalVertical = false) {
		this._isCyclicalHorizontal = isCyclicalHorizontal;
		this._isCyclicalVertical = isCyclicalVertical;
	}

	/**
	 * @override
	 */
	_autoNavigate(fromWidget, direction) {
		let focusedRect = this._startRect;
		if (fromWidget) {
			focusedRect = fromWidget.getFocusedRect() || focusedRect;
		}

		let widgets = this._sortWidgetsByDistance(focusedRect, this._widgets, direction);

		if (!widgets.length && this._isCyclicalEnabledInDirection(direction)) {
			widgets = this._sortWidgetsForCyclicalNavigation(focusedRect, direction, this._widgets);
		}

		return widgets.filter((widget) => widget !== fromWidget && widget.isFocusable());
	}

	/**
	 * @param {Rect} focusedRect
	 * @param {Direction} direction
	 * @param {Array<IWidget>} widgets
	 * @return {Array<IWidget>}
	 * @protected
	 */
	_sortWidgetsForCyclicalNavigation(focusedRect, direction, widgets) {
		const widgetRects = widgets.reduce((rects, widget) => rects.concat(widget.getFocusableRects()), []);
		const navigationArea = Area.create(widgetRects);
		const navigationAreaRect = navigationArea.extrapolate();
		const value = direction.value;
		const invertedSign = -direction.getSign();
		const mirageFocusedRect = focusedRect.clone();
		const {LEFT, RIGHT, UP, DOWN} = Value;

		if (value === LEFT || value === RIGHT) {
			const navigationAreaRectWidth = navigationAreaRect.getSizeX();
			mirageFocusedRect.moveX(invertedSign * navigationAreaRectWidth);
		} else if (value === UP || value === DOWN) {
			const navigationAreaRectHeight = navigationAreaRect.getSizeX();
			mirageFocusedRect.moveY(invertedSign * navigationAreaRectHeight);
		}

		return this._sortWidgetsByDistance(mirageFocusedRect, widgets, direction);
	}

	/**
	 * @param {Rect} sourceRect
	 * @param {Array<IWidget>} widgets
	 * @param {Direction=} direction
	 * @return {Array<IWidget>}
	 * @protected
	 */
	_sortWidgetsByDistance(sourceRect, widgets, direction) {
		const indexAndWeight = [];
		let minDistance;
		const findMinDistance = function(rect) {
			const directionKey = direction ? direction.getKey() : undefined;
			const points = getNavigationPoints(sourceRect, rect, directionKey);
			if (points) {
				minDistance = Math.min(
					minDistance,
					points.fromPoint.getDistance(points.toPoint)
				);
			}
		};
		for (let i = 0; i < widgets.length; i++) {
			minDistance = Infinity;
			widgets[i]
				.getFocusableRects()
				.forEach(findMinDistance);

			if (isFinite(minDistance)) {
				indexAndWeight.push([i, minDistance]);
			}
		}

		indexAndWeight.sort((a, b) => a[1] - b[1]);

		return indexAndWeight.map((a) => widgets[a[0]]);
	}

	/**
	 * @param {Direction} direction
	 * @return {boolean}
	 * @protected
	 */
	_isCyclicalEnabledInDirection(direction) {
		const isHorizontal = direction.isHorizontal();
		return (isHorizontal && this._isCyclicalHorizontal) || (!isHorizontal && this._isCyclicalVertical);
	}

	/**
	 * @return {CanvasRenderingContext2D}
	 * @protected
	 */
	_getDebugCanvas() {
		const canvasId = 'zb-navigation-debug-canvas';
		let canvas = document.getElementById(canvasId);

		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.id = canvasId;
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			canvas.style.position = 'absolute';
			canvas.style.top = '0';
			canvas.style.left = '0';
			canvas.style.zIndex = 99999999999;
			document.body.appendChild(canvas);
		}

		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		return ctx;
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Point} from
	 * @param {Point} to
	 * @param {string} color
	 * @protected
	 */
	_drawNavigationLine(ctx, from, to, color) {
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Array<{
	 *     fromPoint: Point,
	 *     toPoint: Point
	 * }>} points
	 * @protected
	 */
	_drawNavigationLabels(ctx, points) {
		ctx.font = '18px Arial';

		points.forEach((pointsPair) => {
			const distance = pointsPair ? pointsPair.fromPoint.getDistance(pointsPair.toPoint) : Infinity;
			const label = distance.toFixed();

			let x = pointsPair.toPoint.x;
			let y = pointsPair.toPoint.y;

			const labelW = ctx.measureText(label).width + 2;
			const labelH = 17;

			if (x - pointsPair.fromPoint.x < 0) {
				x -= labelW;
			}

			if (y - pointsPair.fromPoint.y < 0) {
				y -= labelH;
			}

			if (isFinite(distance) && distance !== 0) {
				ctx.fillStyle = 'black';
				ctx.fillRect(x, y, labelW, labelH);
				ctx.fillStyle = 'white';
				ctx.fillText(label, x + 1, y + 15);
			}
		});
	}

	/**
	 * Canvas context
	 * @param {CanvasRenderingContext2D} ctx
	 * Rectangle
	 * @param {Rect} rect
	 * @param {string} color
	 * @protected
	 */
	_drawRectangle(ctx, rect, color) {
		const pointA = rect.getPointA();
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.strokeStyle = 'black';
		ctx.rect(pointA.x, pointA.y, rect.getSizeX(), rect.getSizeY());
		ctx.stroke();

		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.strokeStyle = color;
		ctx.rect(pointA.x + 2, pointA.y + 2, rect.getSizeX() - 4, rect.getSizeY() - 4);
		ctx.stroke();
	}
}


/**
 * @param {Rect} fromRect
 * @param {Rect} toRect
 * @param {Value=} directionValue
 * @return {?{
 *     fromPoint: Point,
 *     toPoint: Point
 * }} returns points or null
 */
export const getNavigationPoints = (fromRect, toRect, directionValue) => {
	const direction = directionValue ? Direction.createByKey(directionValue) : null;

	if (toRect.isEmpty()) {
		return null;
	}

	if (direction) {
		const fromBorder = fromRect.getBorderByDirection(direction);
		const toBorder = toRect.getBorderByDirection(direction.invert());

		/*
		 * Move to =>
		 * |-----------|
		 * | from    |-------|
		 * |         | | to  |
		 * |         | |     |
		 * |         |-------|
		 * |-----------|
		 */
		const isCannotMove = (toBorder - fromBorder) * direction.getSign() < 0;

		if (isCannotMove) {
			return null;
		}
	}

	const fromPoint = fromRect.getPointCenter();
	const toPoint = toRect.getPointCenter();

	if (direction) {
		const axis = direction.getAxis();
		const otherAxis = axis === Axis.X ? Axis.Y : Axis.X;

		let otherAxisValue = NaN;

		/*
		 * One of:
		 * |---*---|
		 * |       |
		 * *       *
		 * |       |
		 * |---*---|
		 */
		fromPoint.setAxisValue(axis, fromRect.getBorderByDirection(direction));
		toPoint.setAxisValue(axis, toRect.getBorderByDirection(direction.invert()));

		const toRectPointA = toRect.getPointA();
		const toRectPointB = toRect.getPointB();

		if (
			toRectPointA.getAxisValue(otherAxis) <= fromPoint.getAxisValue(otherAxis) &&
			toRectPointB.getAxisValue(otherAxis) >= fromPoint.getAxisValue(otherAxis)
		) {
			otherAxisValue = fromPoint.getAxisValue(otherAxis);
		} else if (toRectPointB.getAxisValue(otherAxis) < fromPoint.getAxisValue(otherAxis)) {
			otherAxisValue = toRectPointB.getAxisValue(otherAxis);
		} else {
			otherAxisValue = toRectPointA.getAxisValue(otherAxis);
		}

		toPoint.setAxisValue(otherAxis, otherAxisValue);
	}

	return {
		fromPoint,
		toPoint
	};
};


/**
 * @const {string}
 */
const FROM_DEBUG_COLOR = 'red';


/**
 * @const {string}
 */
const TO_DEBUG_COLOR = 'lightgreen';


/**
 * @const {string}
 */
const OTHER_DEBUG_COLOR = 'yellow';
