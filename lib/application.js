/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const AddonLoader = require('./addons/loader');
const AbstractAddon = require('./addons/abstract-addon');
const AbstractPlatform = require('./addons/abstract-platform');
const CodeSource = require('./sources/code-source');
const Server = require('./server');
const PathHelper = require('./path-helper');
const BuildHelper = require('./build-helper');
const Config = require('./config/config');
const TemplateHelper = require('./template-helper');
const VersionsChecker = require('./versions-checker');

/* eslint-disable global-require */


/**
 */
class Application extends EventEmitter {
	/**
	 * @param {string} root
	 * @param {Array<string|Object>=} customConfigs
	 * @param {Array<string|AbstractAddon>=} customAddons
	 */
	constructor(root, customConfigs = [], customAddons = []) {
		super();

		/**
		 * @type {CodeSource}
		 * @private
		 */
		this._codeSource = null;

		/**
		 * @type {PathHelper}
		 * @private
		 */
		this._pathHelper = new PathHelper(root);

		/**
		 * @type {BuildHelper}
		 * @private
		 */
		this._buildHelper = new BuildHelper(this);

		/**
		 * @type {Object}
		 * @private
		 */
		this._packageJson = require(this._pathHelper.getPackageJson());

		/**
		 * @type {TemplateHelper}
		 * @private
		 */
		this._templateHelper = new TemplateHelper(
			() => this._pathHelper.getTemplateLocations(),
			(data) => (data._ = _)
		);

		/**
		 * @type {Config}
		 * @private
		 */
		this._config = new Config();

		/**
		 * @type {AddonLoader}
		 * @private
		 */
		this._addonLoader = new AddonLoader(this._pathHelper.getProjectModulesDir());

		/**
		 * @type {Map<string, string>}
		 * @private
		 */
		this._componentAliases;

		/**
		 * @type {Promise}
		 * @private
		 */
		this._readyPromise;

		this._initAddons(customAddons);

		this._initConfigs(customConfigs);

		// Check the versions compatibility before further actions
		if (!this._config.skipVersionsCheck) {
			this._checkVersions();
		}

		if (this._config.templates.length) {
			this._pathHelper.setAdditionalTemplateLocations(this._config.templates);
		}
	}

	/**
	 * @return {Promise}
	 */
	ready() {
		// TODO: First, this initializes classes and collects files
		// Then it starts watching source directories
		// But we only need to watch sources when running dev server and not when Application class was created
		// programmatically (CLI, etc)
		if (!this._readyPromise) {
			this._initCodeSource();

			this._readyPromise = this._codeSource.ready();
		}

		return this._readyPromise;
	}

	/**
	 * @return {BuildHelper}
	 */
	getBuildHelper() {
		return this._buildHelper;
	}

	/**
	 * @return {PathHelper}
	 */
	getPathHelper() {
		return this._pathHelper;
	}

	/**
	 * @return {?CodeSource}
	 */
	getCodeSource() {
		return this._codeSource;
	}

	/**
	 * @return {Array<string>}
	 */
	getCompilationScripts() {
		let files = this._codeSource.all.getJSFiles();

		for (const entity of this._config.include) {
			files = files.concat(entity.modules || []);
		}

		return files.map((filePath) => this._pathHelper.resolveAbsolutePath(filePath))
			.filter((filePath) => fs.existsSync(filePath));
	}

	/**
	 * @return {Array<string>}
	 */
	getSortedStyles() {
		// ZombieBox first
		const componentsOrder = ['zb'];

		// Addons (extensions and platforms)
		this._addonLoader.getAddons().forEach((addon) => componentsOrder.push(addon.getName()));

		// Application styles
		for (const componentName of this._codeSource.aliasedSources.keys()) {
			if (!componentsOrder.includes(componentName)) {
				componentsOrder.push(componentName);
			}
		}

		let files = [];
		componentsOrder.forEach((componentName) => {
			const componentStyles = this._codeSource.aliasedSources.get(componentName).getCSSFiles();
			files = files.concat(componentStyles);
		});

		// Finally anything included as extra entities
		for (const entity of this._config.include) {
			files = files.concat(entity.css || []);
		}

		return files.map((filePath) => this._pathHelper.resolveAbsolutePath(filePath))
			.filter((filePath) => fs.existsSync(filePath));
	}

	/**
	 * @return {Array<AbstractPlatform>}
	 */
	getPlatforms() {
		return this._addonLoader.getPlatforms();
	}

	/**
	 * @return {Object}
	 */
	getAppPackageJson() {
		return this._packageJson;
	}

	/**
	 * @return {string}
	 */
	getAppVersion() {
		return this.getAppPackageJson().version;
	}

	/**
	 * @return {string}
	 */
	getGeneratedEntryPoint() {
		return path.join(this._pathHelper.resolveAbsolutePath(this._config.generatedCode), 'app.js');
	}

	/**
	 * @return {Object}
	 */
	getZbPackageJson() {
		return require(path.join(this._pathHelper.getInstalledZbPath(), 'package.json'));
	}

	/**
	 * @return {Config}
	 */
	getConfig() {
		return this._config;
	}

	/**
	 * Compile templates, build base classes, etc.
	 */
	buildCode() {
		this._codeSource.cache.buildCode();
	}

	/**
	 * Returns paths to all modules necessary for building
	 * @return {Map<string, string>}
	 */
	getAliases() {
		return this._componentAliases || this.recalculateAliases();
	}

	/**
	 * @return {Map<string, string>}
	 */
	recalculateAliases() {
		this._componentAliases = new Map();

		this._componentAliases.set('generated', this._pathHelper.resolveAbsolutePath(this._config.generatedCode));

		if (this._config.devServer.backdoor) {
			this._componentAliases.set(
				'backdoor',
				this._pathHelper.resolveAbsolutePath(this._config.devServer.backdoor)
			);
		}

		for (const [alias, fsSource] of this._codeSource.aliasedSources.entries()) {
			this._componentAliases.set(alias, fsSource.getRoot());
		}

		const projectAliases = this._config.aliases;
		for (const [name, root] of Object.values(projectAliases)) {
			this._componentAliases.set(name, this._pathHelper.resolveAbsolutePath(root));
		}

		for (const entity of this._config.include) {
			if (entity.aliases) {
				for (const [name, root] of Object.entries(entity.aliases)) {
					this._componentAliases.set(name, this._pathHelper.resolveAbsolutePath(root));
				}
			}
		}

		return this._componentAliases;
	}

	/**
	 * @param {string} aliasedPath
	 * @return {?string}
	 */
	aliasedPathToFsPath(aliasedPath) {
		const map = this.getAliases();

		if (!map) {
			return null;
		}

		const [componentName, ...parts] = aliasedPath.split(path.sep);
		const absolutePath = map.get(componentName);
		if (absolutePath) {
			return [absolutePath, ...parts].join('/');
		}
		return null;
	}

	/**
	 * @param {string} fsPath
	 * @return {?string}
	 */
	fsPathToAliasedPath(fsPath) {
		const map = this.getAliases();
		if (!map) {
			return null;
		}

		for (const [alias, path] of map) {
			if (fsPath.startsWith(path)) {
				return alias + fsPath.slice(path.length);
			}
		}
		return null;
	}

	/**
	 * TODO: reduce complexity
	 * @param {Array<AbstractPlatform>} platforms
	 * @return {Promise}
	 */
	compile(platforms) {
		let resolvePromise = () => {/* Noop */};
		let rejectPromise = () => {/* Noop */};
		const deferred = new Promise((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});

		const mkPlatformDir = (name) => {
			const platformDir = this._pathHelper.getDistDir({
				baseDir: this._config.project.dist,
				version: this.getAppVersion(),
				platformName: name
			});

			if (fs.existsSync(platformDir)) {
				fse.removeSync(platformDir);
			}

			fse.ensureDirSync(platformDir);
			console.log(`Compile app for ${chalk.green(name)} platform in ${chalk.cyan(platformDir)}`);

			return platformDir;
		};

		const runExternalScript = (scriptName, buildDir, platformName, platform, callback) => {
			if (fs.existsSync(scriptName)) {
				try {
					// eslint-disable-next-line global-require
					const externalCallback = require(scriptName);
					externalCallback(callback, {
						app: this,
						buildDir,
						platformName,
						platform: platform || null
					});
				} catch (e) {
					callback(e);
				}
			} else {
				callback();
			}
		};

		this.buildCode();

		/**
		 * @param {AbstractPlatform} platform
		 * @param {function(*)} callback
		 */
		const buildPlatform = (platform, callback) => {
			const dir = mkPlatformDir(platform.getName());
			const args = [dir, platform.getName(), platform];

			runExternalScript(this._pathHelper.getPreBuildHook(), ...args, (error) => {
				if (error) {
					callback(error);

					return;
				}

				this._config.appendObject({
					define: {
						PLATFORM_NAME: platform.getName()
					}
				});

				this._codeSource.cache.generateDefines();

				platform.buildApp(this, dir)
					.then((warnings) => {
						if (warnings) {
							const {report, truncated} = extractCompilationReport(warnings);

							if (truncated) {
								console.warn(truncated);
							}

							if (report) {
								console.log(`Compilation: ${report}`);
							}
						}

						runExternalScript(this._pathHelper.getPostBuildHook(), ...args, (error) => callback(error));
					}, (error) => callback(error));
			});
		};

		const buildFirstPlatform = (callback) => {
			const platform = platforms.shift();
			if (platform) {
				buildPlatform(platform, callback);
			} else {
				callback();
			}
		};

		const buildPlatforms = () => {
			buildFirstPlatform(function done(error) {
				if (error) {
					if (error instanceof Error) {
						console.error(error);
					} else {
						const {report, truncated} = extractCompilationReport(error);

						if (truncated) {
							console.error(truncated);
						}

						if (report) {
							console.log(`Compilation: ${report}`);
						}
					}

					console.log(chalk.red('Build failed!'));

					rejectPromise(error);
				} else if (platforms.length === 0) {
					console.log(chalk.green('Build done'));

					resolvePromise();
				} else {
					buildFirstPlatform(done);
				}
			});
		};

		// TODO: Use JSON output instead of parsing
		const extractCompilationReport = (text) => {
			const regex = /\n?\d+ error\(s\), \d+ warning\(s\)(?:, [\d.,]+% typed)?\n?/;
			const match = text.match(regex);

			let report = '';
			let truncated = text;

			if (match) {
				report = match[0].trim();
				truncated = text.replace(match[0], '');
			}

			return {
				report,
				truncated
			};
		};

		buildPlatforms();

		return deferred;
	}

	/**
	 * Serve development version of application
	 */
	serve() {
		const server = new Server(this);
		const serverConfig = this._config.devServer;

		server.logServer('/log');

		if (serverConfig.enableRawProxy) {
			console.log(`Proxy enabled at ${chalk.cyan('/proxy/?url=...')}`);
			server.rawProxy('/proxy');
		}

		const proxyMap = serverConfig.proxy;
		Object.keys(proxyMap)
			.forEach((path) => {
				console.log(`Proxy path ${chalk.green(path)} from ${chalk.cyan(proxyMap[path])}`);
				server.proxy(path, proxyMap[path]);
			});

		let staticFiles = {};
		for (const entity of this._config.include) {
			if (entity.static) {
				staticFiles = Object.assign(staticFiles, entity.static);
			}
		}

		for (const [customPath, filePath] of Object.entries(staticFiles)) {
			const alias = `/${customPath.replace(/^\//, '')}`;
			const absolutePath = this._pathHelper.resolveAbsolutePath(filePath);

			if (fs.existsSync(absolutePath)) {
				server.serveStatic(alias, absolutePath);
			} else {
				console.warn(`Can't serve static path ${chalk.green(alias)} from ${chalk.cyan(absolutePath)}`);
			}
		}

		server.start(serverConfig.port)
			.then((message) => {
				console.log(message);
			}, (err) => {
				console.error(err.message);
				process.exit(1);
			});
	}

	/**
	 * TODO: rename options (here and in template) to be consistent with config naming
	 * Renders index.html adding all the entities included in config
	 * @param {Object=} extraOptions
	 * @return {string}
	 */
	getIndexHTMLContent(extraOptions = {}) {
		const options = {
			modules: [],
			scripts: [],
			inlineScripts: [],
			styles: [],
			inlineStyles: [],
			...extraOptions
		};

		let inlineScriptFiles = [];

		for (const entity of this._config.include) {
			// Not adding modules because those were added to compilation
			options.scripts = options.scripts.concat(entity.externalScripts || []);
			inlineScriptFiles = inlineScriptFiles.concat(entity.inlineScripts || []);
			// Not adding css either – they go through PostCSS
			options.styles = options.styles.concat(entity.externalCss || []);
		}

		options.inlineScripts = options.inlineScripts.concat(
			inlineScriptFiles
				.map((filename) => this._pathHelper.resolveAbsolutePath(filename))
				.filter((filename) => fs.existsSync(filename))
				.map((filename) => fs.readFileSync(filename, 'utf8'))
		);

		return this._templateHelper.render('index.html.tpl', options);
	}

	/**
	 * @param {Array<string|AbstractAddon>=} customAddons
	 * @protected
	 */
	_initAddons(customAddons) {
		this._addonLoader.loadFromPackageJson(this.getAppPackageJson());

		if (customAddons) {
			this._loadCustomAddons(customAddons);
		}

		this._addonLoader.getAddons().forEach((addon) => {
			addon.setTemplateHelper(this._templateHelper);
		});
	}

	/**
	 * @param {Array<string|Object>} customConfigs
	 * @protected
	 */
	_initConfigs(customConfigs) {
		const defaultConfigPath = path.join(this._pathHelper.getInstalledZbPath(), 'lib', 'config', 'default.js');
		this._config.loadFile(defaultConfigPath);

		this._addonLoader.getAddons().forEach((addon) => {
			this._config.appendObject(addon.getConfig());
		});

		const projectConfigPath = path.join(this._pathHelper.getRootDir(), 'config.js');
		this._loadCustomConfigs([projectConfigPath, ...customConfigs]);

		const configErrors = this._config.validateSchema();
		if (configErrors.length) {
			configErrors.forEach((error) => {
				console.warn(`Config error: Property ${error.property}: ${error.message}`);
			});
			throw new Error('Invalid project configuraion');
		}
	}

	/**
	 * @param {Array<string|AbstractAddon>} addons
	 * @protected
	 */
	_loadCustomAddons(addons) {
		addons.forEach((pathOrAddon) => {
			const type = typeof pathOrAddon;

			if (type === 'string') {
				try {
					this._addonLoader.loadAddon(pathOrAddon);
				} catch (e) {
					throw new Error(`Can't load addon at "${pathOrAddon}": ${e.message}.`);
				}
			} else if (type === 'object') {
				this._addonLoader.addAddon(pathOrAddon);
			} else {
				throw new TypeError(
					`Unexpected type "${type}" for addon loading. ` +
					`Pass a string to load addon from the file system or an instance.`
				);
			}
		});
	}

	/**
	 * @param {Array<string|Object>} configs
	 * @protected
	 */
	_loadCustomConfigs(configs) {
		let loadedSome = false;
		configs.forEach((pathOrObject) => {
			const type = typeof pathOrObject;

			if (type === 'string') {
				try {
					this._config.loadFile(pathOrObject);
					loadedSome = true;
				} catch (e) {
					// ignore
				}
			} else if (type === 'object') {
				this._config.appendObject(pathOrObject);
				loadedSome = true;
			} else {
				throw new TypeError(
					`Unexpected type "${type}" for config loading. ` +
					`Pass a string to load config from the file system or a plain object.`
				);
			}
		});

		if (!loadedSome) {
			console.warn('Could not load any project configs');
		}
	}

	/**
	 * Initialize code providers.
	 * @protected
	 */
	_initCodeSource() {
		this._codeSource = new CodeSource(
			this._addonLoader,
			this._pathHelper,
			this._templateHelper,
			this._config,
			this._packageJson
		);
	}

	/**
	 * @private
	 */
	_checkVersions() {
		const dependencies = this.getAppPackageJson().dependencies || {};
		const packages = [this.getZbPackageJson(), ...this._addonLoader.getPackageJsons()];

		const checker = new VersionsChecker(dependencies, packages);
		const {warns, errors} = checker.check();

		warns.forEach((message) => console.warn(message));

		if (errors.length) {
			throw new Error(errors.join('\n\n'));
		}
	}
}


module.exports = Application;
