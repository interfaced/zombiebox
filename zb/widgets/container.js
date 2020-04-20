/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import app from 'generated/app';
import Direction, {Value} from '../geometry/direction';
import IFocusable from '../interfaces/i-focusable';
import IKeyHandler from '../interfaces/i-key-handler';
import InputDispatcher from '../input-dispatcher';
import Key from '../device/input/key';
import EventPublisher from '../events/event-publisher';
import IStateful from '../history/interfaces/i-stateful';
import Point from '../geometry/point';
import Rect from '../geometry/rect';
import INavigation from './interfaces/i-navigation';
import IWidget from './interfaces/i-widget';
import SpatialNavigation from './navigation/spatial-navigation';
import PrincipalAxisNavigation from './navigation/principal-axis-navigation';


/**
 * @implements {IKeyHandler}
 * @implements {IStateful}
 * @implements {IFocusable}
 */
export default class Container extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * The array of widgets - basic user-controlled elements
		 * @type {Array<IWidget>}
		 * @protected
		 */
		this._widgets = [];

		/**
		 * The array of widgets - basic user-controlled elements
		 * @type {!Object<string, IWidget>}
		 * @protected
		 */
		this._namedWidgets = {};

		/**
		 * @type {INavigation}
		 * @protected
		 */
		this._navigation = this._createNavigation();

		/**
		 * Current active widget
		 * @type {IWidget}
		 * @protected
		 */
		this._activeWidget = null;

		/**
		 * @type {?IWidget}
		 * @protected
		 */
		this._defaultWidget = null;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._navigationDebug = false;

		/**
		 * Defines whether the container is focused
		 * @type {boolean}
		 * @private
		 */
		this._focused = false;

		/**
		 * Fired with: {Array<Container>} {?IWidget}
		 * @const {string}
		 */
		this.EVENT_INNER_FOCUS = 'inner-focus';

		this._onWidgetWantToFocus = this._onWidgetWantToFocus.bind(this);
		this._onWidgetInnerFocus = this._onWidgetInnerFocus.bind(this);
	}

	/**
	 * @override
	 */
	processKey(zbKey, event) {
		const shouldDip = event === undefined ||
			event instanceof KeyboardEvent ||
			event instanceof WheelEvent; // But not MouseEvent in general

		if (shouldDip && this._doDip(zbKey, event)) {
			return true;
		}

		return this._processKey(zbKey, event);
	}

	/**
	 * @override
	 */
	takeSnapshot() {
		return this._takeWidgetsSnapshot();
	}

	/**
	 * @override
	 */
	focus(prevRect) {
		this._focused = true;

		if (this.hasWidgets()) {
			let activeWidget = this.getActiveWidget();
			if (activeWidget && !activeWidget.isFocusable()) {
				activeWidget = null;
			}

			if (!activeWidget && this._defaultWidget && this._defaultWidget.isFocusable()) {
				activeWidget = this._defaultWidget;
			}

			if (!activeWidget && prevRect && this._navigation instanceof SpatialNavigation) {
				const sortedByDistanceWidgets = this._navigation.sortWidgetsByDistance(prevRect)
					.filter((widget) => widget.isFocusable());

				activeWidget = sortedByDistanceWidgets[0] || null;
			}

			this.activateWidget(activeWidget || this.getFirstFocusableWidget(), prevRect);
		}
	}

	/**
	 * @override
	 */
	blur() {
		this._focused = false;

		if (this._activeWidget) {
			this._activeWidget.blur();
		}
	}

	/**
	 * @override
	 */
	isFocused() {
		return this._focused;
	}

	/**
	 * @param {IWidget} widget
	 */
	setDefaultWidget(widget) {
		this.isMyWidget(widget);

		this._defaultWidget = widget;
	}

	/**
	 * Get widget index
	 * @param {IWidget} widget
	 * @return {number}
	 */
	widgetIndex(widget) {
		return this._widgets.indexOf(widget);
	}

	/**
	 * Membership test
	 * @param {IWidget} widget
	 * @throws {Error}
	 */
	isMyWidget(widget) {
		if (this.widgetIndex(widget) === -1) {
			throw new Error('Foreign widget!');
		}
	}

	/**
	 * @return {?IWidget}
	 */
	getActiveWidget() {
		return this._activeWidget;
	}

	/**
	 * @return {?IWidget}
	 */
	getFirstFocusableWidget() {
		if (this.hasWidgets()) {
			for (let i = 0; i < this._widgets.length; i++) {
				if (this._widgets[i].isFocusable()) {
					return this._widgets[i];
				}
			}
		}

		return null;
	}

	/**
	 * @return {!Object<string, IWidget>}
	 */
	getNamedWidgets() {
		return this._namedWidgets;
	}

	/**
	 * @return {Array<IWidget>}
	 */
	getWidgets() {
		return this._widgets;
	}

	/**
	 * @return {boolean}
	 */
	hasWidgets() {
		return this._widgets.length > 0;
	}

	/**
	 * @return {boolean}
	 */
	hasVisibleWidgets() {
		return this.getVisibleWidgets().length > 0;
	}

	/**
	 * @return {Array<IWidget>}
	 */
	getVisibleWidgets() {
		return this._widgets.filter((widget) => widget.isVisible());
	}

	/**
	 * @return {boolean}
	 */
	hasFocusableWidgets() {
		return this.getFocusableWidgets().length > 0;
	}

	/**
	 * @return {Array<IWidget>}
	 */
	getFocusableWidgets() {
		return this._widgets.filter((widget) => widget.isFocusable());
	}

	/**
	 * Append widget to the container
	 * @param {IWidget} widget
	 * @param {string=} name
	 * @return {boolean}
	 */
	appendWidget(widget, name) {
		this._widgets.push(widget);

		this._navigation.addWidget(widget);

		if (name) {
			this._namedWidgets[name] = widget;
		}

		widget.on(widget.EVENT_WANT_FOCUS, this._onWidgetWantToFocus);
		widget.on(widget.EVENT_INNER_FOCUS, this._onWidgetInnerFocus);

		const widgetContainer = widget.getContainer();
		if (widgetContainer) {
			this._getInputDispatcher().addMouseHoverArea(widget, widgetContainer);
		}

		return true;
	}

	/**
	 * @param {IWidget} widget
	 * @return {boolean}
	 */
	removeWidget(widget) {
		const index = this.widgetIndex(widget);
		if (index === -1) {
			return false;
		}

		this._widgets.splice(index, 1);
		this._navigation.removeWidget(widget);

		widget.off(widget.EVENT_WANT_FOCUS, this._onWidgetWantToFocus);

		const widgetContainer = widget.getContainer();
		if (widgetContainer) {
			this._getInputDispatcher().removeMouseHoverArea(widget, widgetContainer);
		}

		for (const name in this._namedWidgets) {
			if (this._namedWidgets.hasOwnProperty(name)) {
				if (this._namedWidgets[name] === widget) {
					delete this._namedWidgets[name];
				}
			}
		}

		if (this.getActiveWidget() === widget) {
			this.activateWidget(null);
		}

		return true;
	}

	/**
	 * Remove all appended widgets
	 */
	removeAllWidgets() {
		for (let widgetIndex = this._widgets.length; widgetIndex--;) {
			this.removeWidget(this._widgets[widgetIndex]);
		}

		this.activateWidget(null);
	}

	/**
	 * @param {?IWidget} widget
	 * @return {string}
	 */
	findNameByWidget(widget) {
		for (const p in this._namedWidgets) {
			if (this._namedWidgets.hasOwnProperty(p) && this._namedWidgets[p] === widget) {
				return p;
			}
		}

		return '';
	}

	/**
	 * @param {string} name
	 * @return {?IWidget}
	 */
	findWidgetByName(name) {
		return this._namedWidgets[name] || null;
	}

	/**
	 * @param {IWidget} widget
	 * @param {Value} direction
	 * @param {?IWidget} widgetTo When null is given this mean "stop navigation"
	 * @param {boolean=} bidirectional
	 */
	setNavigationRule(widget, direction, widgetTo, bidirectional = false) {
		this._navigation.setRule(widget, direction, widgetTo);

		if (bidirectional) {
			const opposite = (new Direction(direction))
				.invert()
				.getKey();

			this._navigation.setRule(widgetTo, opposite, widget);
		}
	}

	/**
	 * @param {IWidget} widget
	 * @param {Value} direction
	 */
	removeNavigationRule(widget, direction) {
		this._navigation.removeRule(widget, direction);
	}

	/**
	 * Drop all navigation rules
	 */
	dropNavigation() {
		this._navigation.clearRules();
	}

	/**
	 * Set widget active
	 * @param {?IWidget} widget
	 * @param {?Rect=} prevRect
	 * @return {boolean}
	 */
	activateWidget(widget, prevRect) {
		const selfFocused = this.isFocused();

		if (widget) {
			this.isMyWidget(widget);

			if (!widget.isFocusable()) {
				return false;
			}
		}

		const oldWidget = this._activeWidget;
		const oldFocusedRect = oldWidget ? oldWidget.getFocusedRect() : null;
		let newWidget = null;

		if (widget === this._activeWidget) {
			if (selfFocused && widget && !widget.isFocused()) {
				newWidget = this._activeWidget;
			}
		} else {
			if (this._activeWidget) {
				this._activeWidget.blur();
			}

			newWidget = widget;
			this._activeWidget = newWidget;
		}

		if (newWidget && selfFocused) {
			this._fireEvent(this.EVENT_INNER_FOCUS, [this], newWidget);
			newWidget.focus(prevRect || oldFocusedRect);
		}

		return true;
	}

	/**
	 * Set widget active
	 * @param {Rect|Point} rectOrPoint
	 * @return {boolean}
	 */
	activateNearestWidget(rectOrPoint) {
		let widgets = [];

		if (this._navigation instanceof SpatialNavigation) {
			widgets = this._navigation.sortWidgetsByDistance(rectOrPoint);
		}

		return widgets.length > 0 && this.activateWidget(widgets[0]);
	}

	/**
	 * @param {boolean} on
	 */
	setNavigationDebug(on) {
		this._navigationDebug = on;
	}

	/**
	 * @return {INavigation}
	 * @protected
	 */
	_createNavigation() {
		return new PrincipalAxisNavigation(
			{enabled: true},
			{enabled: true}
		);
	}

	/**
	 * @return {function()}
	 * @protected
	 */
	_takeWidgetsSnapshot() {
		/** @type {!Object} */
		const snapshots = {};

		const namedWidgets = this.getNamedWidgets();
		for (const p of Object.keys(namedWidgets)) {
			snapshots[p] = namedWidgets[p].takeSnapshot();
		}

		const activeWidgetName = this.findNameByWidget(this.getActiveWidget());

		return () => {
			const existsWidgets = Object.keys(this.getNamedWidgets());

			Object.keys(snapshots)
				.filter((widgetName) => existsWidgets.indexOf(widgetName) !== -1)
				.map((widgetName) => snapshots[widgetName]());

			const activeWidget = this.findWidgetByName(activeWidgetName);
			if (activeWidget) {
				this.activateWidget(activeWidget);
			}
		};
	}

	/**
	 * @return {InputDispatcher}
	 * @protected
	 */
	_getInputDispatcher() {
		return app.getInputDispatcher();
	}

	/**
	 * Activates widget using its predefined direction
	 * @param {Value} direction
	 * @return {boolean}
	 * @protected
	 */
	_activateByDirection(direction) {
		const lastActiveWidget = this._activeWidget;

		const widgets = this._navigation.findWidgets(this._activeWidget, direction);
		if (!widgets) {
			// Stop navigation
			return true;
		}

		let widget;
		let activated = false;

		while (!activated && widgets.length) {
			widget = widgets.shift();
			activated = this.activateWidget(widget);
		}

		if (widget && this._inNavigationDebug() && this._navigation instanceof SpatialNavigation) {
			this._navigation.visualize(lastActiveWidget, widget, widgets, direction);
		}

		return activated;
	}

	/**
	 * @param {Key} zbKey
	 * @param {(KeyboardEvent|MouseEvent)=} event
	 * @return {boolean}
	 * @protected
	 */
	_doDip(zbKey, event) {
		if (this.hasWidgets()) {
			const activeWidget = this.getActiveWidget();
			if (activeWidget && activeWidget.isVisible() && activeWidget.isEnabled()) {
				return activeWidget.processKey(zbKey, event);
			}
		}

		return false;
	}

	/**
	 * @param {Key} zbKey
	 * @param {(KeyboardEvent|MouseEvent)=} event
	 * @return {boolean}
	 * @protected
	 */
	_processKey(zbKey, event) { // eslint-disable-line no-unused-vars
		switch (zbKey) {
			case Key.LEFT:
				return this._activateByDirection(Value.LEFT);
			case Key.UP:
				return this._activateByDirection(Value.UP);
			case Key.RIGHT:
				return this._activateByDirection(Value.RIGHT);
			case Key.DOWN:
				return this._activateByDirection(Value.DOWN);
		}

		return false;
	}

	/**
	 *
	 * @param {string} event
	 * @param {IWidget} widget
	 * @protected
	 */
	_onWidgetWantToFocus(event, widget) {
		this.activateWidget(widget);
	}

	/**
	 *
	 * @param {string} event
	 * @param {Array<Container>} breadcrumbs
	 * @param {?IWidget} child
	 * @protected
	 */
	_onWidgetInnerFocus(event, breadcrumbs, child) {
		this._fireEvent(event, [this].concat(breadcrumbs), child);
	}

	/**
	 * @return {boolean}
	 * @private
	 */
	_inNavigationDebug() {
		return this._navigationDebug;
	}
}
