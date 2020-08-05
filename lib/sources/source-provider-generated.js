/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const path = require('path');
const fse = require('fs-extra');
const kleur = require('kleur');

const SourceProviderBase = require('./source-provider-base');
const ISourceProvider = require('./i-source-provider');
const AbstractExtension = require('../addons/abstract-extension');
const AddonLoader = require('../addons/loader');
const {IZombieBoxConfig} = require('../config/interface');
const PathHelper = require('../path-helper');
const TemplateHelper = require('../template-helper');
const logger = require('../logger').createChild('Generated');


/**
 * @implements {ISourceProvider}
 */
class SourceProviderGenerated extends SourceProviderBase {
	/**
	 * @param {CodeSource} codeSource
	 * @param {AddonLoader} addonLoader
	 * @param {PathHelper} pathHelper
	 * @param {TemplateHelper} templateHelper
	 * @param {IZombieBoxConfig} buildConfig
	 * @param {Object} packageJson
	 */
	constructor(codeSource, addonLoader, pathHelper, templateHelper, buildConfig, packageJson) {
		super();

		/**
		 * @type {PathHelper}
		 * @protected
		 */
		this._pathHelper = pathHelper;

		/**
		 * @type {string}
		 * @protected
		 */
		this._root = pathHelper.resolveAbsolutePath(buildConfig.generatedCode);

		/**
		 * @type {TemplateHelper}
		 * @protected
		 */
		this._templateHelper = templateHelper;

		/**
		 * @type {IZombieBoxConfig}
		 * @protected
		 */
		this._buildConfig = buildConfig;

		/**
		 * @type {Object}
		 * @protected
		 */
		this._packageJson = packageJson;

		/**
		 * @type {AddonLoader}
		 * @protected
		 */
		this._addonLoader = addonLoader;

		/**
		 * @type {Map<AbstractExtension, function()>}
		 * @protected
		 */
		this._extensionListeners = new Map();

		this._readyPromise = codeSource.fs.ready()
			.then(() => this.generate());
	}

	/**
	 * @override
	 */
	watch() {
		this._addonLoader.getExtensions().forEach((extension) => {
			const listener = (sources) => {
				this._onExtensionGeneratedCode(extension, sources);
			};
			extension.on(AbstractExtension.EVENT_GENERATED, listener);
			this._extensionListeners.set(extension, listener);
		});
	}

	/**
	 * @override
	 */
	stopWatching() {
		for (const [extension, listener] of this._extensionListeners) {
			extension.off(listener);
		}
		this._extensionListeners.clear();
	}

	/**
	 */
	async clean() {
		logger.debug(`Cleaning up ${kleur.underline(this._root)}`);
		await fse.emptyDir(this._root);
		this._files = [];
	}

	/**
	 * Clean and build code.
	 */
	async generate() {
		await this.clean();

		await Promise.all([
			this.generateBaseApp(),
			this.generateExtensionsCode(),
			this.generateDefines()
		]);
	}

	/**
	 */
	async generateBaseApp() {
		const platformNames = this._addonLoader.getPlatforms()
			.map((platform) => platform.getName());

		// PC is a special platform that can't be detected properly and should be the last in the list
		if (platformNames.includes('pc')) {
			platformNames.splice(platformNames.findIndex((name) => name === 'pc'), 1);
			platformNames.push('pc');
		}

		const mainPath = this._buildConfig.project.name + '/' +
			path.relative(
				this._pathHelper.resolveAbsolutePath(this._buildConfig.project.src),
				this._pathHelper.resolveAbsolutePath(this._buildConfig.project.entry)
			).replace(/\\/g, '/');

		await Promise.all([
			this._writeFile(
				'base-application.js',
				this._templateHelper.render('base-application.js.tpl', {
					platforms: platformNames
				})
			),
			this._writeFile(
				'app.js',
				this._templateHelper.render('app.js.tpl', {
					path: mainPath.replace(/\.js$/, '')
				})
			)
		]);
	}

	/**
	 */
	async generateExtensionsCode() {
		await Promise.all(
			this._addonLoader.getExtensions().map((extension) => {
				const sources = this._resolveAddonRelativeSources(extension, extension.generateCode(this._buildConfig));
				return this._writeSources(sources);
			})
		);
	}

	/**
	 */
	async generateDefines() {
		/**
		 * @param {Array<*>} array
		 * @return {string}
		 */
		const getArrayContentsType = (array) => {
			if (!array.length) {
				return '*';
			}

			const elementTypes = array.map((element) => getGCCType(element));
			return Array.from(new Set(elementTypes))
				.join('|');
		};

		/**
		 * @param {*} value
		 * @return {string}
		 */
		const getGCCType = (value) => {
			const jsType = typeof value;

			if (jsType === 'function') {
				return 'Function';
			}

			if (jsType !== 'object') {
				return jsType;
			}

			if (value === null) {
				return 'null';
			}

			if (Array.isArray(value)) {
				return `Array<${getArrayContentsType(value)}>`;
			}

			return 'Object';
		};

		/**
		 * @param {string} type
		 * @return {string}
		 */
		const printTypeTag = (type) => type === 'Object' ?
			'@struct' :
			`@const {${type}}`;

		/**
		 * @param {...string} tags
		 * @return {string}
		 */
		const printJsdoc = (...tags) => [
			'/**',
			...tags.map((tag) => ` * ${tag}`),
			' */',
			''
		].join('\n');

		/**
		 * @param {string} string
		 * @return {string}
		 */
		const indent = (string) => '\t' + string.split('\n')
			.join('\n\t');

		/**
		 * @param {Object} object
		 * @return {string}
		 */
		const printObject = (object) => [
			'{',
			indent(
				Object.keys(object)
					.map((key) => {
						const value = object[key];
						const type = getGCCType(value);

						return printJsdoc(printTypeTag(type)) +
							`${key}: ${printValue(type, value)}`;
					})
					.join(',\n\n')
			),
			'}'
		].join('\n');

		/**
		 * @param {string} type
		 * @param {*} value
		 * @return {string}
		 */
		const printValue = (type, value) => {
			switch (type) {
				case 'Object':
					return printObject(value);
				case 'number':
				case 'Function':
					return value.toString();
				default:
					return JSON.stringify(value);
			}
		};

		const content = Object.keys(this._buildConfig.define)
			.map((topLevelKey) => {
				const value = this._buildConfig.define[topLevelKey];
				const type = getGCCType(value);

				return printJsdoc(printTypeTag(type)) +
					`export const ${topLevelKey} = ${printValue(type, value)};`;
			})
			.join('\n\n');

		await this._writeFile('define.js', content);
	}

	/**
	 * @param {AbstractExtension} addon
	 * @param {Object<string, string>} sources
	 * @return {Object<string, string>}
	 * @protected
	 */
	_resolveAddonRelativeSources(addon, sources) {
		const filePaths = Object.keys(sources);
		return filePaths.reduce((result, filePath) => {
			const addonRelativePath = path.join(addon.getName(), filePath);
			return Object.assign(result, {[addonRelativePath]: sources[filePath]});
		}, {});
	}

	/**
	 * @param {AbstractExtension} extension
	 * @param {Object<string, string>} sources
	 * @protected
	 */
	async _onExtensionGeneratedCode(extension, sources) {
		logger.debug(
			`Extension ${kleur.green(extension.getName())} generated files: \n\t` +
			Object.keys(sources).join('\n\t')
		);
		await this._writeSources(this._resolveAddonRelativeSources(extension, sources));
	}

	/**
	 * @param {Object<string, string>} sources
	 * @protected
	 */
	async _writeSources(sources) {
		return Promise.all(
			Object.entries(sources)
				.map(([src, content]) => this._writeFile(src, content))
		);
	}

	/**
	 * @param {string} src
	 * @param {string} content
	 * @protected
	 */
	async _writeFile(src, content) {
		const filename = path.join(this._root, src);

		const dir = path.dirname(filename);
		await fse.ensureDir(dir);

		logger.silly(`Generated file ${kleur.underline(filename)}`);
		await fse.writeFile(filename, content, 'utf-8');
		if (!this._files.includes(filename)) {
			this._files.push(filename);
		}

		this.emit(ISourceProvider.EVENT_CHANGED, filename);
		this.emit(ISourceProvider.EVENT_ANY, ISourceProvider.EVENT_CHANGED, filename);
	}
}


module.exports = SourceProviderGenerated;
