/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {EventEmitter} from 'events';
import TemplateHelper from '../template-helper.js';


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


export default AbstractAddon;
