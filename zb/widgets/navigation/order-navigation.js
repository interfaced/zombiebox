/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Value as DirectionValue} from '../../geometry/direction';
import AbstractNavigation from './abstract-navigation';


/**
 */
export default class OrderNavigation extends AbstractNavigation {
	/**
	 * @override
	 */
	_autoNavigate(fromWidget, direction) {
		const widgetIndex = this._getWidgetIndex(fromWidget);
		const directionKey = direction.getKey();
		if (directionKey === DirectionValue.UP || directionKey === DirectionValue.LEFT) {
			// Previous widgets
			return this._widgets.slice(0, widgetIndex - 1)
				.reverse();
		}

		// DOWN|RIGHT next widgets
		return this._widgets.slice(widgetIndex + 1);
	}
}
