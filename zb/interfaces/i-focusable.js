/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Rect from '../geometry/rect';


/**
 * @interface
 */
export default class IFocusable {
	/**
	 * @param {?Rect=} opt_fromRect
	 */
	focus(opt_fromRect) {}

	/**
	 * Object looses focus
	 */
	blur() {}

	/**
	 * @return {boolean}
	 */
	isFocused() {}
}
