/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import EventPublisher from '../events/event-publisher';


/**
 */
export default class AbstractModel extends EventPublisher {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {Object<string, *>}
		 * @protected
		 */
		this._data = {};

		/**
		 * Fired with: nothing
		 * @const {string}
		 */
		this.EVENT_CHANGE = 'change';
	}

	/**
	 * @return {string}
	 */
	toString() {
		const props = ['name', 'title', 'label', 'subject', 'value', 'description', 'desc'];
		for (let i = 0; i < props.length; i++) {
			if (this._data.hasOwnProperty(props[i])) {
				return String(this._data[props[i]]);
			}
		}

		return Object.prototype.toString.call(this);
	}

	/**
	 * @param {string} name
	 * @return {*}
	 * @protected
	 */
	_getPureProperty(name) {
		return this._data[name];
	}

	/**
	 * @param {string} name
	 * @param {*} value
	 * @protected
	 */
	_setPureProperty(name, value) {
		if (this._data.hasOwnProperty(name)) {
			const oldValue = this._data[name];

			this._data[name] = value;

			if (oldValue !== value) {
				this._fireEvent(this.EVENT_CHANGE, name, value, oldValue);
				this._fireEvent(`change:${name}`, name, value, oldValue);
			}
		} else {
			this._data[name] = value;
			this._fireEvent(`add:${name}`, name, value);
		}
	}

	/**
	 * @param {Function} childConstructor
	 * @param {!Object} props
	 */
	static appendProperties(childConstructor, props) {
		Object.defineProperties(childConstructor.prototype, props);
	}

	/**
	 * @param {string} name
	 * @param {PropertyConfig=} config
	 * @return {?}
	 */
	static prop(name, config = {}) {
		return {
			enumerable: config.enumerable !== undefined ? config.enumerable : true,
			get: config.getter || AbstractModel._getDefaultGetter(name),
			set: config.setter || AbstractModel._getDefaultSetter(name)
		};
	}

	/**
	 * @param {string} name
	 * @return {function(this: AbstractModel): *}
	 * @protected
	 */
	static _getDefaultGetter(name) {
		return function() {
			return this._getPureProperty(name); // eslint-disable-line no-invalid-this
		};
	}

	/**
	 * @param {string} name
	 * @return {function(this: AbstractModel, *): *}
	 * @protected
	 */
	static _getDefaultSetter(name) {
		return function(value) {
			return this._setPureProperty(name, value); // eslint-disable-line no-invalid-this
		};
	}
}


/**
 * @typedef {{
 *     getter: (function()|undefined),
 *     setter: (function()|undefined),
 *     enumerable: (boolean|undefined)
 * }}
 */
export let PropertyConfig;
