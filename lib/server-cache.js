const fse = require('fs-extra');
const kleur = require('kleur');
const logger = require('./logger').createChild('Server Cache');


/**
 */
class ServerCache {
	/**
	 * @param {Preprocessor} preprocessor
	 */
	constructor(preprocessor) {
		/**
		 * @type {Preprocessor}
		 * @protected
		 */
		this._preprocessor = preprocessor;

		/**
		 * @type {Map<string, CacheItem>}
		 * @private
		 */
		this._cache = new Map();
	}

	/**
	 * @param {string} filePath
	 * @return {Promise<string>}
	 */
	async get(filePath) {
		const hit = this._cache.get(filePath);
		const stats = await fse.stat(filePath);
		const changeTime = stats.mtimeMs;

		if (hit && hit.time === changeTime) {
			return hit.data;
		}

		logger.silly(`Cache miss on ${kleur.underline(filePath)}`);

		const content = await fse.readFile(filePath, 'utf-8');
		const updated = await this._preprocessor(content, filePath);
		this._cache.set(filePath, {
			time: changeTime,
			data: updated
		});

		return updated;
	}
}


/**
 * @typedef {{
 *     time: number,
 *     data: string
 * }}
 */
let CacheItem;


/**
 * @typedef {function(string, string): string|Promise<string>}
 */
let Preprocessor;


module.exports = ServerCache;
