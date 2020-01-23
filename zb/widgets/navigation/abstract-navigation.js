/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Direction, {Value} from '../../geometry/direction';
import INavigation from '../interfaces/i-navigation';
import IWidget from '../interfaces/i-widget';


/**
 * @abstract
 * @implements {INavigation}
 */
export default class AbstractNavigation {
	/**
	 */
	constructor() {
		/**
		 * @type {Array<Rule>}
		 * @protected
		 */
		this._rules = [];

		/**
		 * @type {Array<IWidget>}
		 * @protected
		 */
		this._widgets = [];
	}

	/**
	 * @override
	 */
	findWidgets(fromWidget, direction) {
		const rule = fromWidget && this._getWidgetRule(fromWidget);

		if (rule && rule.hasOwnProperty(direction)) {
			const value = rule[direction];

			return value && [value];
		}

		return this._autoNavigate(fromWidget, Direction.create(direction));
	}

	/**
	 * @override
	 */
	setWidgets(widgets) {
		widgets.forEach(this.addWidget.bind(this));
	}

	/**
	 * @override
	 */
	addWidget(widget) {
		this._widgets.push(widget);
		this._rules.push({});
	}

	/**
	 * @override
	 */
	removeWidget(widget) {
		const index = this._widgets.indexOf(widget);
		if (index !== -1) {
			this._widgets.splice(index, 1);
			this._rules.splice(index, 1);

			this._rules.forEach((rule) => {
				Object.keys(rule)
					.forEach((direction) => {
						direction = /** @type {Value} */ (direction);

						if (rule[direction] === widget) {
							delete rule[direction];
						}
					});
			});
		}
	}

	/**
	 * @override
	 */
	setRule(from, direction, to) {
		this._getWidgetRule(from)[direction] = to;
	}

	/**
	 * @override
	 */
	removeRule(from, direction) {
		delete this._getWidgetRule(from)[direction];
	}

	/**
	 * @override
	 */
	clearRules() {
		for (let i = 0; i < this._rules.length; i++) {
			this._rules[i] = {};
		}
	}

	/**
	 * @abstract
	 * @param {?IWidget} fromWidget
	 * @param {Direction} direction
	 * @return {Array<IWidget>}
	 * @protected
	 */
	_autoNavigate(fromWidget, direction) {}

	/**
	 * @param {IWidget} widget
	 * @return {Rule}
	 * @protected
	 */
	_getWidgetRule(widget) {
		return this._rules[this._getWidgetIndex(widget)];
	}

	/**
	 * @param {IWidget} widget
	 * @return {number}
	 * @protected
	 *
	 */
	_getWidgetIndex(widget) {
		const index = this._widgets.indexOf(widget);
		if (index !== -1) {
			return index;
		}

		throw new Error('Unknown widget');
	}
}


/**
 * @typedef {!Object<Value, ?IWidget>}
 */
export let Rule;
