/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const path = require('path');
const kleur = require('kleur');
const logger = require('./logger').createChild('Path');


/**
 */
class PathHelper {
	/**
	 * @param {string} root
	 */
	constructor(root) {
		/**
		 * @type {string}
		 * @private
		 */
		this._projectPath = root;

		/**
		 * @type {Array<string>}
		 * @private
		 */
		this._additionalTemplateLocations = [];

		/**
		 * @type {string}
		 * @private
		 */
		this._installedZbPath;

		/**
		 * @type {string}
		 * @private
		 */
		this._frameworkPath;

		try {
			// Find ZombieBox that the application actually depends on
			// which might be different from currently running version
			// This way it also keeps symlinks if --preserve-symlinks option was given to node
			this._installedZbPath = path.dirname(
				require.resolve(
					'zombiebox/package.json', // eslint-disable-line node/no-missing-require
					{paths: [this._projectPath]}
				)
			);

			logger.debug(`ZombieBox path: ${kleur.underline(this._installedZbPath)}`);
		} catch (e) {
			if (e.code !== 'MODULE_NOT_FOUND') {
				throw e;
			}

			// If that failed somehow, resort to running ZombieBox version
			this._installedZbPath = path.join(__dirname, '..');
		}

		this._frameworkPath = path.join(this._installedZbPath, 'zb');
	}

	/**
	 * @param {string} relative
	 * @return {string}
	 */
	resolveAbsolutePath(relative) {
		return path.resolve(this._projectPath, relative);
	}

	/**
	 * @return {string}
	 */
	getInstalledZbPath() {
		return this._installedZbPath;
	}

	/**
	 * @param {Array<string>} locations
	 */
	setAdditionalTemplateLocations(locations) {
		this._additionalTemplateLocations = locations;
	}

	/**
	 * Zombiebox project root
	 * @return {string}
	 */
	getRootDir() {
		return this._projectPath;
	}

	/**
	 * Client library path
	 * @return {string}
	 */
	getFrameworkPath() {
		return this._frameworkPath;
	}

	/**
	 * @param {{
	 *     baseDir: string,
	 *     version: (string|undefined),
	 *     platformName: (string|undefined)
	 * }} params
	 * @return {string} хуй знает
	 */
	getDistDir({
		baseDir,
		version,
		platformName
	}) {
		let dir = baseDir;

		if (version) {
			dir = path.join(dir, version);
		}

		if (platformName) {
			dir = path.join(dir, platformName);
		}

		return this.resolveAbsolutePath(dir);
	}

	/**
	 * @return {string}
	 */
	getPackageJson() {
		return path.join(this.getRootDir(), 'package.json');
	}

	/**
	 * @return {string}
	 */
	getPreBuildHook() {
		return path.join(this.getRootDir(), 'prebuild.js');
	}

	/**
	 * @return {string}
	 */
	getPostBuildHook() {
		return path.join(this.getRootDir(), 'postbuild.js');
	}

	/**
	 * @return {Array<string>}
	 */
	getTemplateLocations() {
		return this._additionalTemplateLocations
			.concat([
				path.join(this.getRootDir(), 'templates'),
				path.join(this._installedZbPath, 'templates')
			])
			.map((file) => this.resolveAbsolutePath(file));
	}

	/**
	 * @return {string}
	 */
	getProjectModulesDir() {
		return path.join(this.getRootDir(), 'node_modules');
	}

	/**
	 * @param {string} filename
	 * @return {boolean}
	 */
	static isLocal(filename) {
		return filename.startsWith('./') ||
		filename.startsWith('../') ||
		filename.startsWith('/');
	}
}


module.exports = PathHelper;
