/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {updateClassName} from '../html';
import Key from '../device/input/key';
import Rect from '../geometry/rect';
import Container from './container';
import IWidget from './interfaces/i-widget';


/**
 * Base class for all widgets - Layer items
 * Overload with your own, to get user-controlled scene and popup elements
 * @implements {IWidget}
 */
export default class Widget extends Container {
	/**
	 */
	constructor() {
		super();

		/**
		 * Parent container for other widget elements
		 * @type {HTMLElement}
		 * @protected
		 */
		this._container = null;

		/**
		 * Defines if Widget is enabled. Widget can be visible, but if it's disabled;
		 * that means user can't navigate to it
		 * @type {boolean}
		 * @protected
		 */
		this._enabled = true;

		/**
		 * Defines if Widget is visible
		 * @type {boolean}
		 * @protected
		 */
		this._visible = true;

		/**
		 * @type {boolean}
		 * @protected
		 */
		this._isParentDOMVisible = false;

		/**
		 * Class used for hover/blur states
		 * @type {string}
		 * @protected
		 */
		this._focusClass = '_active';

		/**
		 * @override
		 */
		this.EVENT_FOCUS = 'focus';

		/**
		 * @override
		 */
		this.EVENT_BLUR = 'blur';

		/**
		 * @override
		 */
		this.EVENT_WANT_FOCUS = 'want-focus';
	}

	/**
	 * @override
	 */
	getContainer() {
		return this._container;
	}

	/**
	 * @override
	 */
	setContainer(container) {
		this._container = container;
		container.classList.add('zb-widget');
	}

	/**
	 * @override
	 */
	getContainerRect() {
		if (!this.isVisible()) {
			return null;
		}

		return Rect.createByClientRect(this._container.getBoundingClientRect());
	}

	/**
	 * @override
	 */
	getFocusableRects() {
		let rects = [];
		if (!this.isVisible()) {
			return rects;
		}

		if (this.hasFocusableWidgets()) {
			this.getFocusableWidgets()
				.forEach((widget) => {
					rects = rects.concat(widget.getFocusableRects());
				});

			return rects;
		}

		const containerRect = this.getContainerRect();
		if (!containerRect) {
			return rects;
		}
		rects.push(containerRect);

		return rects;
	}

	/**
	 * @override
	 */
	getFocusedRect() {
		if (this.hasFocusableWidgets()) {
			if (this.getActiveWidget()) {
				return this.getActiveWidget().getFocusedRect();
			}

			return null;
		}

		return this.getContainerRect();
	}

	/**
	 * @override
	 */
	hide() {
		this.setVisible(false);
	}

	/**
	 * @override
	 */
	show() {
		this.setVisible(true);
	}

	/**
	 * @override
	 */
	isVisible() {
		return this.getVisible();
	}

	/**
	 * @override
	 */
	getVisible() {
		return this._visible;
	}

	/**
	 * @override
	 */
	setVisible(value) {
		if (this._visible === value) {
			return;
		}

		this._visible = value;

		this._passDOMVisibilityToChildWidgets(this._visible);

		if (this.getParentDOMVisible()) {
			if (this._visible) {
				this.beforeDOMShow();
				this._container.style.display = '';
				this.afterDOMShow();
			} else {
				this.beforeDOMHide();
				this._container.style.display = 'none';
				this.afterDOMHide();
			}
		} else if (this._visible) {
			this._container.style.display = '';
		} else {
			this._container.style.display = 'none';
		}
	}

	/**
	 * @override
	 */
	setParentDOMVisible(visible) {
		this._isParentDOMVisible = visible;
		this._passDOMVisibilityToChildWidgets(visible && this._visible);
	}

	/**
	 * @override
	 */
	getParentDOMVisible() {
		return this._isParentDOMVisible;
	}

	/**
	 * @override
	 */
	isParentDOMVisible() {
		return this.getParentDOMVisible();
	}

	/**
	 * @override
	 */
	isDOMVisible() {
		return this.isVisible() && this.isParentDOMVisible();
	}

	/**
	 * @override
	 */
	beforeDOMShow() {
		this._widgets.forEach((widget) => widget.beforeDOMShow());
	}

	/**
	 * @override
	 */
	beforeDOMHide() {
		this._widgets.forEach((widget) => widget.beforeDOMHide());
	}

	/**
	 * @override
	 */
	afterDOMShow() {
		this._widgets.forEach((widget) => widget.afterDOMShow());
	}

	/**
	 * @override
	 */
	afterDOMHide() {
		this._widgets.forEach((widget) => widget.afterDOMHide());
	}

	/**
	 * @override
	 */
	blur() {
		super.blur();

		this._onBlur();
		this._fireEvent(this.EVENT_BLUR);
	}

	/**
	 * @override
	 */
	focus(prevRect) {
		super.focus(prevRect);

		this._onFocus();
		this._fireEvent(this.EVENT_FOCUS, prevRect);
	}

	/**
	 * @override
	 */
	enable() {
		this.setEnabled(true);
	}

	/**
	 * @override
	 */
	disable() {
		this.setEnabled(false);
	}

	/**
	 * @override
	 */
	isEnabled() {
		return this.getEnabled();
	}

	/**
	 * @override
	 */
	getEnabled() {
		return this._enabled;
	}

	/**
	 * @override
	 */
	setEnabled(value) {
		this._enabled = value;
		updateClassName(this._container, '_disabled', !this._enabled);
	}

	/**
	 * @override
	 */
	isFocusable() {
		return this._enabled && this._visible;
	}

	/**
	 * @override
	 */
	mouseOver(event) {
		if (!this.isFocused()) {
			this._fireEvent(this.EVENT_WANT_FOCUS, this);
		}
	}

	/**
	 * @override
	 */
	mouseClick(event) {
		if (this.isEnabled() && this.processKey(Key.ENTER, event)) {
			event.stopPropagation();
		}
	}

	/**
	 * Adds focus class to an container
	 * @protected
	 */
	_onFocus() {
		this._container.classList.add(this._focusClass);
	}

	/**
	 * Remove focus from an container
	 * @protected
	 */
	_onBlur() {
		this._container.classList.remove(this._focusClass);
	}

	/**
	 * @param {boolean} visible
	 * @protected
	 */
	_passDOMVisibilityToChildWidgets(visible) {
		this._widgets.forEach((widget) => widget.setParentDOMVisible(visible));
	}

	/**
	 * Add CSS class name to layer container
	 * @param {string} cssClass
	 * @protected
	 */
	_addContainerClass(cssClass) {
		this._container.classList.add(cssClass);
	}

	/**
	 * Remove CSS class name to layer container
	 * @param {string} cssClass
	 * @protected
	 */
	_removeContainerClass(cssClass) {
		this._container.classList.remove(cssClass);
	}
}
