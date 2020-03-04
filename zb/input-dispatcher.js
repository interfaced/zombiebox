/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
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

		/**
		 * @type {Map<HTMLElement, function(Event)>}
		 * @protected
		 */
		this._mouseHoverAreaMapElementToListener = new Map();
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
	 * @param {IWidget} widget
	 * @param {HTMLElement} element
	 */
	addMouseHoverArea(widget, element) {
		if (this._input.isPointingDeviceSupported() && !this._mouseHoverAreaMapElementToListener.has(element)) {
			const listener = this._widgetMouseOverListener.bind(this, widget);

			element.addEventListener('mouseover', listener, false);
			element.addEventListener('click', listener, false);
			this._mouseHoverAreaMapElementToListener.set(element, listener);
		}
	}

	/**
	 * @param {IWidget} widget
	 * @param {HTMLElement} element
	 */
	removeMouseHoverArea(widget, element) {
		if (this._input.isPointingDeviceSupported()) {
			const listener = this._mouseHoverAreaMapElementToListener.get(element);
			if (listener) {
				element.removeEventListener('mouseover', listener, false);
				element.removeEventListener('click', listener, false);
				this._mouseHoverAreaMapElementToListener.delete(element);
			}
		}
	}

	/**
	 * @param {IWidget} widget
	 * @param {Event} event
	 * @protected
	 */
	_widgetMouseOverListener(widget, event) {
		if (!this._input.isBlocked()) {
			switch (event.type) {
				case 'mouseover':
					widget.mouseOver(/** @type {MouseEvent} */ (event));
					break;
				case 'click':
					widget.mouseClick(/** @type {MouseEvent} */ (event));
					break;
			}
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
