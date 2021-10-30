/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import AbstractAddon from './abstract-addon.js';
import {IZombieBoxConfig} from '../config/interface.js';


/**
 * @abstract
 */
class AbstractExtension extends AbstractAddon {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {?CodeSource}
		 * @protected
		 */
		this._codeSource = null;
	}

	/**
	 * Returns object of fileName:code pairs
	 * @abstract
	 * @param {IZombieBoxConfig} projectConfig
	 * @return {Object<string, string>}
	 */
	generateCode(projectConfig) {
		return {};
	}

	/**
	 * @param {CodeSource} codeSource
	 */
	setCodeSource(codeSource) {
		this._codeSource = codeSource;
	}
}


/**
 * Fired with: {Object<string, string>} generated sources map
 * @const {string}
 */
AbstractExtension.EVENT_GENERATED = 'event-generated';


export default AbstractExtension;
