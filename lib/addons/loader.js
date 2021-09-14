/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs = require('fs');
const path = require('path');
const kleur = require('kleur');

const {findPackageJson} = require('../utils');
const AbstractAddon = require('./abstract-addon');
const AbstractPlatform = require('./abstract-platform');
const AbstractExtension = require('./abstract-extension');
const logger = require('../logger').createChild('AddonLoader');

/* eslint-disable node/global-require */


/**
 */
class AddonLoader {
	/**
	 * @param {string} projectModulesDir
	 */
	constructor(projectModulesDir) {
		/**
		 * @type {string}
		 * @private
		 */
		this._projectModulesDir = projectModulesDir;

		/**
		 * @type {Array<LoadedAddon>}
		 * @private
		 */
		this._loadedAddons = [];
	}

	/**
	 * @return {Array<Object>}
	 */
	getPackageJsons() {
		return this._loadedAddons.map((addon) => addon.packageJson)
			.filter(Boolean);
	}

	/**
	 * @return {Array<AbstractAddon>}
	 */
	getAddons() {
		return this._loadedAddons.map((addon) => addon.instance);
	}

	/**
	 * @return {Array<AbstractExtension>}
	 */
	getExtensions() {
		return this.getAddons()
			.filter((addon) => addon instanceof AbstractExtension);
	}

	/**
	 * @return {Array<AbstractPlatform>}
	 */
	getPlatforms() {
		return this.getAddons()
			.filter((addon) => addon instanceof AbstractPlatform);
	}

	/**
	 * @param {Object} packageJson
	 */
	loadFromPackageJson(packageJson) {
		const dependencies = Object.keys(packageJson['dependencies'] || {})
			.filter((packageName) => packageName.startsWith(PACKAGE_PREFIX));

		logger.debug(`Addons found in package.json: \n\t${dependencies.join('\n\t')}`);

		dependencies.map((packageName) => this._resolvePackagePath(packageName))
			.forEach((packagePath) => this.loadAddon(packagePath));
	}

	/**
	 * @param {string} addonPath
	 */
	loadAddon(addonPath) {
		logger.debug(`Loading addon from ${kleur.underline(addonPath)}`);

		const Addon = require(addonPath);

		const addon = /** @type {AbstractAddon} */ (new Addon());
		const packageJson = require(findPackageJson(addonPath));

		this.addAddon(addon, packageJson);
	}

	/**
	 * @param {AbstractAddon} addon
	 * @param {Object=} packageJson
	 */
	addAddon(addon, packageJson = null) {
		if (!(addon instanceof AbstractAddon)) {
			const maybeAddonName = addon && typeof addon.getName === 'function' ? addon.getName() : 'unknown name';

			throw new Error(`Trying to add not an addon: ${addon} (${maybeAddonName})`);
		}

		if (this._isLoaded(addon)) {
			throw new Error(`Addon with name ${kleur.bold(addon.getName())} is already loaded`);
		}

		this._loadedAddons.push({instance: addon, packageJson});

		const type =
			addon instanceof AbstractPlatform ? 'platform' :
				addon instanceof AbstractExtension ? 'extension' :
					'addon';

		logger.info(`Loaded ${type} ${kleur.green(addon.getName())}`);
	}

	/**
	 * @param {string} packageName
	 * @return {string}
	 * @protected
	 */
	_resolvePackagePath(packageName) {
		const localPackage = path.join(this._projectModulesDir, packageName);

		return fs.existsSync(localPackage) ? localPackage : require.resolve(packageName);
	}

	/**
	 * @param {AbstractAddon} addon
	 * @return {boolean}
	 * @protected
	 */
	_isLoaded(addon) {
		return this._loadedAddons.some((loadedAddon) =>
			loadedAddon.instance.getName() === addon.getName()
		);
	}
}


/**
 * @const {string}
 */
const PACKAGE_PREFIX = 'zombiebox-';


/**
 * @typedef {{
 *     instance: AbstractAddon,
 *     packageJson: ?Object
 * }}
 */
let LoadedAddon;


module.exports = AddonLoader;
