/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
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
	 * @param {AxisConfig=} horizontal
	 * @param {AxisConfig=} vertical
	 * @param {boolean=} enableFallback
	 */
	constructor(horizontal = {}, vertical = {}, enableFallback = true) {
		const horizontalNormalized = {
			...DEFAULT_AXIS_CONFIG,
			...horizontal
		};
		const verticalNormalized = {
			...DEFAULT_AXIS_CONFIG,
			...vertical
		};

		super(horizontalNormalized.cyclical, verticalNormalized.cyclical);

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isHorizontalAxisNavigationEnabled;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isVerticaAxisNavigationEnabled;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isFallbackEnabled;

		this.setAxisNavigationEnabled(
			horizontalNormalized.enabled,
			verticalNormalized.enabled,
			enableFallback
		);
	}

	/**
	 * @param {boolean=} horizontal
	 * @param {boolean=} vertical
	 * @param {boolean=} enableFallback
	 */
	setAxisNavigationEnabled(horizontal = false, vertical = false, enableFallback = true) {
		this._isHorizontalAxisNavigationEnabled = horizontal;
		this._isVerticaAxisNavigationEnabled = vertical;
		this._isFallbackEnabled = enableFallback;
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
		}

		if (!widgets.length && this._isFallbackEnabled) {
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
 *     enabled: (boolean|undefined),
 *     cyclical: (boolean|undefined)
 * }}
 */
export let AxisConfig;
