/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs = require('fs');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const ISourceProvider = require('./sources/i-source-provider');


/**
 */
class StylesCache {
	/**
	 * @param {ISourceProvider} fsSource
	 * @param {Object} postcssConfig
	 */
	constructor(fsSource, postcssConfig) {
		/**
		 * @type {Object<string, string>}
		 * @protected
		 */
		this._cache = {};

		/**
		 * @type {ISourceProvider}
		 * @protected
		 */
		this._source = fsSource;

		/**
		 * @type {postcss.Processor}
		 * @private
		 */
		this._postcssProcessor = postcss([
			postcssPresetEnv({...postcssConfig.presetEnv}),
			...postcssConfig.extraPlugins
		]);

		fsSource.on(ISourceProvider.EVENT_CHANGED, (filePath) => {
			if (this._source.isCSS(filePath) && this._cache.hasOwnProperty(filePath)) {
				this.updateCache(filePath);
			}
		});
	}

	/**
	 * @param {string} src
	 * @return {Promise<string>}
	 */
	getContent(src) {
		const value = this._cache[src];
		if (typeof value !== 'undefined') {
			return Promise.resolve(value);
		}

		return this.updateCache(src);
	}

	/**
	 * @param {string} src
	 * @return {Promise<string>}
	 */
	updateCache(src) {
		const fileSource = fs.readFileSync(src, 'utf-8');

		return this._postcssProcessor.process(fileSource, {from: src})
			.then((result) => {
				this._cache[src] = result.css;
				return this._cache[src];
			});
	}
}


module.exports = StylesCache;
