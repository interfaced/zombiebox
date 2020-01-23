/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Value} from '../../geometry/direction';
import IWidget from './i-widget';


/**
 * @interface
 */
export default class INavigation {
	/**
	 * @param {?IWidget} fromWidget
	 * @param {Value} direction
	 * @return {?Array<IWidget>}
	 */
	findWidgets(fromWidget, direction) {}

	/**
	 * @param {IWidget} widget
	 */
	addWidget(widget) {}

	/**
	 * @param {IWidget} widget
	 */
	removeWidget(widget) {}

	/**
	 * @param {Array<IWidget>} widgets
	 */
	setWidgets(widgets) {}

	/**
	 * @param {IWidget} from
	 * @param {Value} direction
	 * @param {?IWidget} to
	 */
	setRule(from, direction, to) {}

	/**
	 * @param {IWidget} from
	 * @param {Value} direction
	 */
	removeRule(from, direction) {}

	/**
	 * Drop all rules (forget, empty);
	 */
	clearRules() {}
}
