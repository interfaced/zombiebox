/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
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

		this._watcher = chokidar.watch(root, {});
		this._watcher.on('all', this._onEvent.bind(this));

		this._readyPromise = this._waitReadyPromise();
	}

	/**
	 * @param {string} event – Chokidar event, not to be confused with ISourceProvider events
	 * @param {string} filePath
	 * @protected
	 */
	_onEvent(event, filePath) {
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

	/**
	 * @return {Promise}
	 * @private
	 */
	_waitReadyPromise() {
		return new Promise((resolve) => {
			const ready = () => {
				clearTimeout(forceResolve);
				this._watcher.removeListener('ready', ready);
				resolve();
			};

			const forceResolve = setTimeout(ready, 5000);

			this._watcher.on('ready', ready);
		});
	}
}


module.exports = SourceProviderFS;
