/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import AbstractAddon from './abstract-addon.js';
import Application from '../application.js';


/**
 * @abstract
 */
class AbstractPlatform extends AbstractAddon {
	/**
	 * Build application in given dir.
	 * @deprecated
	 * @abstract
	 * @param {Application} application
	 * @param {string} distDir
	 * @return {Promise<string, string>} Promise resolved with warnings or rejected with errors.
	 */
	buildApp(application, distDir) {
		throw new Error(`AbstractPlatform.buildApp is not implemented in ${this.getName()}`);
	}

	/**
	 * Packages application that was built in distDir
	 * @abstract
	 * @param {Application} application
	 * @param {string} distDir
	 * @return {Promise}
	 */
	async pack(application, distDir) {
		throw new Error(`AbstractPlatform.pack is not implemented in ${this.getName()}`);
	}
}


export default AbstractPlatform;
