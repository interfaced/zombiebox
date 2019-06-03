/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IWidget from '../interfaces/i-widget';
import Rect from '../../geometry/rect';
import SpatialNavigation from './spatial-navigation';


/**
 */
export default class PrincipalAxisNavigation extends SpatialNavigation {
	/**
	 * @param {AxisConfig=} opt_horizontal
	 * @param {AxisConfig=} opt_vertical
	 * @param {boolean=} opt_enableFallback
	 */
	constructor(opt_horizontal = DEFAULT_AXIS_CONFIG, opt_vertical = DEFAULT_AXIS_CONFIG, opt_enableFallback = false) {
		super(opt_horizontal.cyclical, opt_vertical.cyclical);

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isHorizontalAxisNavigationEnabled = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isVerticaAxisNavigationEnabled = false;

		/**
		 * @type {boolean}
		 * @private
		 */
		this._isFallbackEnabled = true;

		this.setAxisNavigationEnabled(
			opt_horizontal.enabled,
			opt_vertical.enabled,
			opt_enableFallback
		);
	}

	/**
	 * @param {boolean=} opt_horizontal
	 * @param {boolean=} opt_vertical
	 * @param {boolean=} opt_enableFallback
	 */
	setAxisNavigationEnabled(opt_horizontal = false, opt_vertical = false, opt_enableFallback = true) {
		this._isHorizontalAxisNavigationEnabled = opt_horizontal;
		this._isVerticaAxisNavigationEnabled = opt_vertical;
		this._isFallbackEnabled = opt_enableFallback;
	}

	/**
	 * @override
	 */
	_autoNavigate(fromWidget, direction) {
		let focusedRect = this._startRect;
		if (fromWidget) {
			focusedRect = fromWidget.getFocusedRect() || focusedRect;
		}

		const isHorizontal = direction.isHorizontal();
		const isHorizontalEnabled = isHorizontal && this._isHorizontalAxisNavigationEnabled;
		const isVerticalEnabled = !isHorizontal && this._isVerticaAxisNavigationEnabled;
		let widgets = [];

		if (isHorizontalEnabled || isVerticalEnabled) {
			const focusableWidgets = this._widgets.filter((widget) => widget !== fromWidget && widget.isFocusable());
			const areaWidgets = this._getAreaWidgets(focusedRect, isHorizontal, focusableWidgets);

			widgets = this._sortWidgetsByDistance(focusedRect, areaWidgets, direction);

			if (!widgets.length && this._isCyclicalEnabledInDirection(direction)) {
				widgets = this._sortWidgetsForCyclicalNavigation(focusedRect, direction, areaWidgets);
			}
		} else if (this._isFallbackEnabled) {
			widgets = super._autoNavigate(fromWidget, direction);
		}

		return widgets;
	}

	/**
	 * @override
	 */
	_sortWidgetsForCyclicalNavigation(focusedRect, direction, widgets) {
		if (this._isFallbackEnabled &&
			!this._isHorizontalAxisNavigationEnabled &&
			!this._isVerticaAxisNavigationEnabled) {
			return super._sortWidgetsForCyclicalNavigation(focusedRect, direction, widgets);
		}

		let sortedWidgets = [];
		const isHorizontal = direction.isHorizontal();
		const isHorizontalCyclical = isHorizontal && this._isCyclicalHorizontal;
		const isVerticalCyclical = !isHorizontal && this._isCyclicalVertical;

		if (isHorizontalCyclical || isVerticalCyclical) {
			const invertedDirection = direction.invert();
			sortedWidgets = this._sortWidgetsByDistance(focusedRect, widgets, invertedDirection).reverse();
		}

		return sortedWidgets;
	}

	/**
	 * @param {Rect} sourceRect
	 * @param {boolean} isHorizontal True for horizontal, false for vertical
	 * @param {Array<IWidget>} widgets
	 * @return {Array<IWidget>}
	 * @private
	 */
	_getAreaWidgets(sourceRect, isHorizontal, widgets) {
		const areaFilter = (widget) => {
			const rects = widget.getFocusableRects();
			const {x0, x1, y0, y1} = sourceRect.getValue();

			const targetArea = isHorizontal ?
				Rect.createHorizontalInfiniteRect(y0, y1) :
				Rect.createVerticalInfiniteRect(x0, x1);

			return rects.some((rect) => targetArea.isIntersects(rect));
		};

		return widgets.filter(areaFilter);
	}
}


/**
 * @const {AxisConfig}
 */
const DEFAULT_AXIS_CONFIG = {
	enabled: false,
	cyclical: false
};


/**
 * @typedef {{
 *     enabled: boolean,
 *     cyclical: boolean
 * }}
 */
export let AxisConfig;
