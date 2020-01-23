/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const EventEmitter = require('events').EventEmitter;
const TemplateHelper = require('../template-helper');


/**
 * @abstract
 */
class AbstractAddon extends EventEmitter {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {?TemplateHelper}
		 * @protected
		 */
		this._templateHelper = null;
	}

	/**
	 * @abstract
	 * @return {string}
	 */
	getName() {
		throw new Error('AbstractAddon.getName is not implemented');
	}

	/**
	 * @abstract
	 * @return {?string}
	 */
	getSourcesDir() {
		throw new Error('AbstractAddon.getSourcesDir is not implemented');
	}

	/**
	 * @return {Object}
	 */
	getConfig() {
		return {};
	}

	/**
	 * @abstract
	 * @param {Yargs} yargs
	 * @param {Application} application
	 */
	buildCLI(yargs, application) {}

	/**
	 * @param {TemplateHelper} templateHelper
	 */
	setTemplateHelper(templateHelper) {
		this._templateHelper = templateHelper;
	}
}


/**
 * @typedef {{
 *     argv: Array<*>
 * }}
 */
let Yargs;


module.exports = AbstractAddon;
