/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const kleur = require('kleur');
const SourceProviderFS = require('./source-provider-fs');
const SourceProviderGenerated = require('./source-provider-generated');
const SourceProviderGroup = require('./source-provider-group');
const AddonLoader = require('../addons/loader');
const {IZombieBoxConfig} = require('../config/interface');
const PathHelper = require('../path-helper');
const TemplateHelper = require('../template-helper');
const logger = require('../logger').createChild('CodeSource');


/**
 */
class CodeSource {
	/**
	 * @param {AddonLoader} addonLoader
	 * @param {PathHelper} pathHelper
	 * @param {TemplateHelper} templateHelper
	 * @param {IZombieBoxConfig} buildConfig
	 * @param {Object} packageJson
	 */
	constructor(addonLoader, pathHelper, templateHelper, buildConfig, packageJson) {
		/**
		 * @type {Map<string, SourceProviderFS>}
		 */
		this.aliasedSources = new Map();

		/**
		 * @type {SourceProviderGroup}
		 */
		this.fs;

		/**
		 * @type {SourceProviderGenerated}
		 */
		this.generated;

		/**
		 * @type {SourceProviderGroup}
		 */
		this.all;

		this._appendAliasedSource('zb', pathHelper.getFrameworkPath());
		this._appendAliasedSource(buildConfig.project.name, pathHelper.resolveAbsolutePath(buildConfig.project.src));

		addonLoader.getAddons().forEach((addon) => {
			this._appendAliasedSource(addon.getName(), addon.getSourcesDir());
		});

		this.fs = new SourceProviderGroup(...Array.from(this.aliasedSources.values()));
		this.generated = new SourceProviderGenerated(
			this,
			addonLoader,
			pathHelper,
			templateHelper,
			buildConfig,
			packageJson
		);
		this.all = new SourceProviderGroup(this.fs, this.generated);
	}

	/**
	 * @return {Promise}
	 */
	ready() {
		return this.all.ready()
			.then(() => logger.debug(`CodeSource ready`));
	}

	/**
	 */
	watch() {
		this.all.watch();
	}

	/**
	 */
	stopWatching() {
		this.all.stopWatching();
	}

	/**
	 * @param {string} name
	 * @param {string} root
	 * @protected
	 */
	_appendAliasedSource(name, root) {
		logger.debug(`Registering aliased source ${kleur.bold(name)} from ${kleur.underline(root)}`);

		this.aliasedSources.set(name, new SourceProviderFS(root));
	}
}


module.exports = CodeSource;
