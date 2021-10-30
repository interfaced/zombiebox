/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import kleur from 'kleur';
import SourceProviderFS from './source-provider-fs.js';
import SourceProviderGenerated from './source-provider-generated.js';
import SourceProviderGroup from './source-provider-group.js';
import AddonLoader from '../addons/loader.js';
import {IZombieBoxConfig} from '../config/interface.js';
import PathHelper from '../path-helper.js';
import TemplateHelper from '../template-helper.js';
import {createChild} from '../logger.js';
const logger = createChild('CodeSource');


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


export default CodeSource;
