/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Key from '../device/input/key';


/**
 * @interface
 */
export default class IKeyHandler {
	/**
	 * @param {Key} zbKey
	 * @param {(KeyboardEvent|MouseEvent)=} event
	 * @return {boolean} True if Key handled, false if not
	 */
	processKey(zbKey, event) {}
}
