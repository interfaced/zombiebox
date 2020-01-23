/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const klaw = require('klaw');
const chokidar = require('chokidar');

const SourceProviderBase = require('./source-provider-base');
const ISourceProvider = require('./i-source-provider');


/**
 * @implements {ISourceProvider}
 */
class SourceProviderFS extends SourceProviderBase {
	/**
	 * @param {string} root
	 */
	constructor(root) {
		super();

		/**
		 * @type {string}
		 * @protected
		 */
		this._root = root;

		/**
		 * @type {chokidar.FSWatcher}
		 * @protected
		 */
		this._watcher = null;

		/**
		 * @type {Array<string>}
		 * @protected
		 */
		this._files = [];

		this._readyPromise = this._collectFiles();
	}

	/**
	 * @override
	 */
	watch() {
		if (this._watcher) {
			return Promise.resolve();
		}

		this._watcher = chokidar.watch(this._root, {});
		this._watcher.on('all', (event, filePath) => this._onWatcherEvent(event, filePath));
	}

	/**
	 * @override
	 */
	stopWatching() {
		if (this._watcher) {
			this._watcher.close();
		}
	}

	/**
	 * @return {Promise}
	 * @protected
	 */
	_collectFiles() {
		return new Promise((resolve, reject) => {
			klaw(this._root)
				.on('data', (item) => {
					if (!item.stats.isDirectory()) {
						this._files.push(item.path);
					}
				})
				.on('end', () => resolve())
				.on('error', (e) => reject(e));
		});
	}

	/**
	 * @param {string} event – Chokidar event, not to be confused with ISourceProvider events
	 * @param {string} filePath
	 * @protected
	 */
	_onWatcherEvent(event, filePath) {
		const {EVENT_CHANGED, EVENT_DELETED, EVENT_ADDED, EVENT_ANY} = ISourceProvider;
		switch (event) {
			case 'change':
				this.emit(EVENT_CHANGED, filePath);
				this.emit(EVENT_ANY, EVENT_CHANGED, filePath);
				break;
			case 'unlink':
				const index = this._files.indexOf(filePath);
				if (-1 !== index) {
					this._files.splice(index, 1);
					this.emit(EVENT_DELETED, filePath);
					this.emit(EVENT_ANY, EVENT_DELETED, filePath);
				}
				break;
			case 'add':
				if (!this._files.includes(filePath)) {
					this._files.push(filePath);
					this.emit(EVENT_ADDED, filePath);
					this.emit(EVENT_ANY, EVENT_ADDED, filePath);
				}
				break;
		}
	}
}


module.exports = SourceProviderFS;
