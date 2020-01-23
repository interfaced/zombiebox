/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const ISourceProvider = require('./i-source-provider');
const EventEmitter = require('events').EventEmitter;
const path = require('path');


/**
 * @implements {ISourceProvider}
 */
class SourceProviderBase extends EventEmitter {
	/**
	 */
	constructor() {
		super();

		/**
		 * @type {?string}
		 * @protected
		 */
		this._root = null;

		/**
		 * @type {Array<string>}
		 * @protected
		 */
		this._files = [];

		/**
		 * @type {Promise}
		 * @protected
		 */
		this._readyPromise = Promise.resolve();
	}

	/**
	 * @override
	 */
	ready() {
		return this._readyPromise;
	}

	/**
	 * @override
	 */
	watch() {/* Do nothing, descendants might override this */}

	/**
	 * @override
	 */
	stopWatching() {/* Do nothing, descendants might override this */}

	/**
	 * @override
	 */
	getRoot() {
		return this._root;
	}

	/**
	 * @override
	 */
	getFiles() {
		return this._files;
	}

	/**
	 * @override
	 */
	getJSFiles() {
		return this._files.filter(this.isJS);
	}

	/**
	 * @override
	 */
	getCSSFiles() {
		return this._files.filter(this.isCSS);
	}

	/**
	 * @param {string} filename
	 * @return {boolean}
	 */
	isJS(filename) {
		return path.extname(filename) === '.js';
	}

	/**
	 * @param {string} filename
	 * @return {boolean}
	 */
	isCSS(filename) {
		return path.extname(filename) === '.css';
	}
}


module.exports = SourceProviderBase;
