/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const AbstractAddon = require('./abstract-addon');


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


module.exports = AbstractExtension;
