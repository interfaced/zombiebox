/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import IFocusable from '../../interfaces/i-focusable';
import IKeyHandler from '../../interfaces/i-key-handler';
import IEventPublisher from '../../events/interfaces/i-event-publisher';
import IStateful from '../../history/interfaces/i-stateful';
import Rect from '../../geometry/rect';


/**
 * @interface
 * @extends {IEventPublisher}
 * @extends {IKeyHandler}
 * @extends {IStateful}
 * @extends {IFocusable}
 */
export default class IWidget {
	/**
	 * @return {HTMLElement}
	 */
	getContainer() {}

	/**
	 * @param {HTMLElement} container
	 */
	setContainer(container) {}

	/**
	 * @return {Array<Rect>}
	 */
	getFocusableRects() {}

	/**
	 * @return {?Rect}
	 */
	getFocusedRect() {}

	/**
	 * @return {?Rect}
	 */
	getContainerRect() {}

	/**
	 * Enable widget
	 */
	enable() {}

	/**
	 * Disable widget
	 */
	disable() {}

	/**
	 * @return {boolean}
	 */
	isEnabled() {}

	/**
	 * @return {boolean}
	 */
	getEnabled() {}

	/**
	 * @param {boolean} value
	 */
	setEnabled(value) {}

	/**
	 * Show Widget container and set its visibility to true
	 */
	show() {}

	/**
	 * Hide Widget container and set its visibility to false
	 */
	hide() {}

	/**
	 * @param {boolean} visible
	 */
	setParentDOMVisible(visible) {}

	/**
	 * @return {boolean}
	 */
	getParentDOMVisible() {}

	/**
	 * @return {boolean}
	 */
	isParentDOMVisible() {}

	/**
	 * @return {boolean}
	 */
	isDOMVisible() {}

	/**
	 * Called before widget shown.
	 */
	beforeDOMShow() {}

	/**
	 * Called before widget hidden.
	 */
	beforeDOMHide() {}

	/**
	 * Called after widget shown.
	 */
	afterDOMShow() {}

	/**
	 * Called after widget hidden.
	 */
	afterDOMHide() {}

	/**
	 * @return {boolean}
	 */
	isVisible() {}

	/**
	 * @return {boolean}
	 */
	getVisible() {}

	/**
	 * @param {boolean} value
	 */
	setVisible(value) {}

	/**
	 * Check if Widget can be focused.
	 * It's possible if Widget is both visible and enabled
	 * @return {boolean}
	 */
	isFocusable() {}

	/**
	 * Handle mouse over event
	 * @param {MouseEvent} event
	 */
	mouseOver(event) {}

	/**
	 * Handle mouse click event
	 * @param {MouseEvent} event
	 */
	mouseClick(event) {}
}


/**
 * Fired with: (?Rect|undefined)
 * @const {string} Widget focused.
 */
IWidget.prototype.EVENT_FOCUS;


/**
 * @const {string} widget loose focus
 */
IWidget.prototype.EVENT_BLUR;


/**
 * @const {string} widget want to focus
 */
IWidget.prototype.EVENT_WANT_FOCUS;


/**
 * @const {string} focus changed somewhere between widget descendants
 */
IWidget.prototype.EVENT_INNER_FOCUS;
