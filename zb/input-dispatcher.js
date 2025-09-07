/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IKeyHandler from './interfaces/i-key-handler';
import IInput from './device/interfaces/i-input';
import IWidget from './widgets/interfaces/i-widget';


/**
 */
export default class InputDispatcher {
	/**
	 * @param {IKeyHandler} target
	 */
	constructor(target) {
		/**
		 * @type {IKeyHandler}
		 * @protected
		 */
		this._target = target;

		/**
		 * @type {IInput}
		 * @protected
		 */
		this._input = null;

		this._widgetMouseOverListener = this._widgetMouseOverListener.bind(this);
	}

	/**
	 *
	 * @param {IInput} input
	 */
	setInput(input) {
		this._input = input;
	}

	/**
	 */
	init() {
		this._input.setKeyEventHandler(this._onKeyEvent.bind(this));
	}

	/**
	 * @param {HTMLElement} element
	 */
	addMouseListener(element) {
		if (this._input.isPointingDeviceSupported()) {
			element.addEventListener('mouseover', this._widgetMouseOverListener, false);
			element.addEventListener('click', this._widgetMouseOverListener, false);
		}
	}

	/**
	 * @param {HTMLElement} element
	 */
	removeMouseListener(element) {
		if (this._input.isPointingDeviceSupported()) {
			element.removeEventListener('mouseover', this._widgetMouseOverListener, false);
			element.removeEventListener('click', this._widgetMouseOverListener, false);
		}
	}

	/**
	 * @param {HTMLElement} element
	 * @return {?IWidget}
	 * @protected
	 */
	_findWidgetFromElement(element) {
		let el = element;
		while (el && el.nodeType === 1) {
			const w = el[InputDispatcher.WIDGET_REF_KEY];
			if (w) {
				return w;
			}
			el = el.parentElement;
		}
		return null;
	}

	/**
	 * @param {Event} event
	 * @protected
	 */
	_widgetMouseOverListener(event) {
		if (this._input.isBlocked()) {
			return;
		}
		const target = event.target;
		if (!(target instanceof HTMLElement)) {
			return;
		}
		const widget = this._findWidgetFromElement(target);
		if (!widget) {
			return;
		}
		switch (event.type) {
			case 'mouseover':
				widget.mouseOver(/** @type {MouseEvent} */ (event));
				break;
			case 'click':
				widget.mouseClick(/** @type {MouseEvent} */ (event));
				break;
		}
	}

	/**
	 *
	 * @param {(KeyboardEvent|WheelEvent)} e
	 * @return {boolean}
	 * @protected
	 */
	_onKeyEvent(e) {
		if (!this._input.isBlocked()) {
			const zbKey = this._input.eventToKeyCode(e);
			const result = this._target.processKey(zbKey, e);

			if (result) {
				e.preventDefault();

				return false;
			}
		} else {
			e.preventDefault();
		}

		return true;
	}
}


/**
 * @type {string}
 */
InputDispatcher.WIDGET_REF_KEY = '__zbWidgetRef_' + Math.random()
	.toString(36)
	.slice(2);
