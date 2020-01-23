/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * @interface
 */
class ISourceProvider {
	/**
	 * @return {Promise}
	 */
	ready() {}

	/**
	 */
	watch() {}

	/**
	 */
	stopWatching() {}

	/**
	 * @return {string}
	 */
	getRoot() {}

	/**
	 * @return {Array<string>}
	 */
	getFiles() {}

	/**
	 * @return {Array<string>}
	 */
	getJSFiles() {}

	/**
	 * @return {Array<string>}
	 */
	getCSSFiles() {}
}


/**
 * Fired with: {string}, {string} eventName (one of the following) and file path
 * @const {string}
 */
ISourceProvider.EVENT_ANY = 'any';


/**
 * Fired with: {string} file path
 * @const {string}
 */
ISourceProvider.EVENT_DELETED = 'deleted';


/**
 * Fired with: {string} file path
 * @const {string}
 */
ISourceProvider.EVENT_ADDED = 'added';


/**
 * Fired with: {string} file path
 * @const {string}
 */
ISourceProvider.EVENT_CHANGED = 'changed';


module.exports = ISourceProvider;
