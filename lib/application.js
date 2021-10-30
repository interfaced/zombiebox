/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import kleur from 'kleur';
import _ from 'lodash';
import {EventEmitter} from 'events';

import AddonLoader from './addons/loader.js';
import AbstractAddon from './addons/abstract-addon.js';
import AbstractPlatform from './addons/abstract-platform.js';
import CodeSource from './sources/code-source.js';
import Server from './server.js';
import PathHelper from './path-helper.js';
import BuildHelper from './build-helper.js';
import Config from './config/config.js';
import TemplateHelper from './template-helper.js';
import VersionsChecker from './versions-checker.js';
import {createChild} from './logger.js';
const logger = createChild('APP');


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
		this._packageJson = JSON.parse(fs.readFileSync(this._pathHelper.getPackageJson(), 'utf-8'));
		/**
		 * @type {TemplateHelper}
		 * @private
		 */
		this._templateHelper = new TemplateHelper(
			() => this._pathHelper.getTemplateLocations(),
			(data) => {
				data._ = _;
				data.config = this.getConfig();
			}
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
		this._readyPromise = this._initAddons(customAddons)
			.then(() => {
				return this._initConfigs(customConfigs);
			})
			.then(() => {
				// Check the versions compatibility before further actions
				if (this._config.skipVersionsCheck) {
					logger.warn('Skipped verification of version compatibility between ZombieBox components');
				} else {
					this._checkVersions();
				}
			})
			.then(() => {
				if (this._config.templates.length) {
					this._pathHelper.setAdditionalTemplateLocations(this._config.templates);
				}
			})
			.then(() => {
				this._initCodeSource();
				return this._codeSource.ready();
			});
	}

	/**
	 * @return {Promise}
	 */
	ready() {
		logger.silly(`Readying application`);
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
			files = files.concat(entity.modules || [])
				.map((filePath) => this._pathHelper.resolveAbsolutePath(filePath))
				.filter(
					(filename) => {
						const exists = fs.existsSync(filename);
						if (!exists) {
							logger.warn(`File ${kleur.underline(filename)} does not exist`);
						}
						return exists;
					}
				);
		}

		logger.silly(`Compiling js files: \n\t${files.join('\n\t')}`);

		return files;
	}

	/**
	 * @return {Array<string>}
	 */
	async getSortedStyles() {
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

		logger.debug(`CSS files priorities: ${componentsOrder.join(', ')}`);

		let files = [];
		componentsOrder.forEach((componentName) => {
			const componentStyles = this._codeSource.aliasedSources.get(componentName).getCSSFiles();
			files = files.concat(componentStyles);
		});

		// Finally anything included as extra entities
		for (const entity of this._config.include) {
			if (entity.css) {
				for (const filePath of entity.css) {
					const absolutePath = this._pathHelper.resolveAbsolutePath(filePath);
					const exists = await fse.exists(absolutePath);
					if (exists) {
						files.push(absolutePath);
					} else {
						logger.warn(`File ${kleur.underline(absolutePath)} does not exist`);
					}
				}
			}
		}

		logger.silly(`Compiling css files: \n\t${files.join('\n\t')}`);

		return files;
	}

	/**
	 * @return {Array<AbstractPlatform>}
	 */
	getPlatforms() {
		return this._addonLoader.getPlatforms();
	}

	/**
	 * @param {string} name
	 * @return {?AbstractPlatform}
	 */
	getPlatformByName(name) {
		return this.getPlatforms()
			.find((platform) => platform.getName() === name);
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
		const fsPath = path.join(this._pathHelper.getInstalledZbPath(), 'package.json');
		return JSON.parse(fs.readFileSync(fsPath, 'utf-8'));
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
	async buildCode() {
		await this._codeSource.generated.generate();
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

		const [componentName, ...parts] = aliasedPath.split('/');
		const absolutePath = map.get(componentName);
		if (absolutePath) {
			return path.join(absolutePath, ...parts);
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
				return alias + fsPath.slice(path.length).replace(/\\/g, '/');
			}
		}
		return null;
	}

	/**
	 * @param {AbstractPlatform} platform
	 * @return {Promise}
	 */
	async build(platform) {
		logger.verbose(`Building application for ${platform.getName()}`);

		const buildHelper = this.getBuildHelper();
		const distDir = this._pathHelper.getDistDir({
			baseDir: this._config.project.dist,
			version: this.getAppVersion(),
			platformName: platform.getName()
		});
		/**
		 * @param {string} filename
		 * @param {string} content
		 * @return {Promise}
		 */
		const writeFileToDist = (filename, content) => fse.writeFile(path.join(distDir, filename), content, 'utf8');

		logger.debug(`Cleaning up ${distDir}`);
		await fse.emptyDir(distDir);

		await this._runBuildHook(this._pathHelper.getPreBuildHook(), platform);

		this._config.appendObject({
			define: {
				PLATFORM_NAME: platform.getName()
			}
		});

		await this._codeSource.generated.generateDefines();

		const [cssCompilationResult, jsCompilationResult] = await Promise.all([
			buildHelper.getCompressedStyles(distDir),
			buildHelper.getCompressedScripts()
		]);

		const options = await this.collectResourcesFromConfigByPlatform(platform);
		const fileWriteTasks = [
			buildHelper.copyStaticFiles(distDir)
		];

		if (this._config.build.inlineCSS) {
			options.inlineStyles.push(cssCompilationResult.css);
		} else {
			options.styles.push('app.css');
			fileWriteTasks.push(writeFileToDist('app.css', cssCompilationResult.css));
		}

		if (this._config.build.inlineJS) {
			options.inlineScripts.push(jsCompilationResult.stdout);
		} else {
			const libsSources = options.inlineScripts.join(';\n');
			options.inlineScripts = [];
			options.scripts.push('libs.js', 'app.js');

			fileWriteTasks.push(
				writeFileToDist('libs.js', libsSources),
				writeFileToDist('app.js', jsCompilationResult.stdout)
			);
		}
		const indexHtmlContent = this.getIndexHTMLContent(options);
		fileWriteTasks.push(writeFileToDist('index.html', indexHtmlContent));
		await Promise.all(fileWriteTasks);

		const cssCompilationReport = cssCompilationResult.messages;
		let jsCompilationReport;
		try {
			jsCompilationReport = JSON.parse(jsCompilationResult.stderr);
		} catch (e) {
			logger.debug(jsCompilationResult.stderr);
			logger.debug(e.stack);

			const match = e.message.match(/Unexpected token (?:.+) in JSON at position (?<position>\d+)/);
			let message = `Failed to parse GCC output: ${e.message}`;
			if (match && match.groups.position) {
				message += '\n' + jsCompilationResult.stderr.slice(parseInt(match.groups.position, 10));
			}
			throw new Error(message);
		}

		logger.silly(`GCC compilation report: \n${JSON.stringify(jsCompilationReport, null, '\t')}`);
		logger.silly(`CSS compilation report: \n${JSON.stringify(cssCompilationReport, null, '\t')}`);

		cssCompilationReport.forEach((message) => {
			// TODO: fancier output
			logger.info(`CSS compilation message: ${JSON.stringify(message, null, 4)}`);
		});

		jsCompilationReport.forEach((message) => {
			if (message.level === 'info') {
				logger.output(message.description);
			} else if (message.level === 'error' || message.level === 'warning') {
				// Highlight zombiebox package name
				const filename = message.source && message.source.replace(
					/(?<=\/)zombiebox.+?(?=\/)/g,
					(name) => kleur.bold(name)
				);

				const logLine = [
					filename && `${filename}:${message.line}:${message.column}`,
					`${message.level.toUpperCase()} [${message.key}]`,
					message.description,
					message.context
				].filter(Boolean).join('\n') + '\n';

				logger[{
					'error': 'error',
					'warning': 'warn'
				}[message.level]](logLine);
			} else {
				logger.debug(`Unrecognized GCC message \n${JSON.stringify(message, null, '\t')}`);
			}
		});

		if (jsCompilationResult.stdout) {
			logger.output(`Compilation successful!`);
		} else {
			logger.error(`Compilation failed!`);
		}

		await this._runBuildHook(this._pathHelper.getPostBuildHook(), platform);
	}

	/**
	 * @param {AbstractPlatform} platform
	 * @return {Promise}
	 */
	async pack(platform) {
		const distDir = this._pathHelper.getDistDir({
			baseDir: this._config.project.dist,
			version: this.getAppVersion(),
			platformName: platform.getName()
		});
		logger.verbose(`Packaging application`);
		await platform.pack(this, distDir);
	}

	/**
	 * Serve development version of application
	 */
	serve() {
		const server = new Server(this);
		const serverConfig = this._config.devServer;

		server.logServer('/log');

		if (serverConfig.enableRawProxy) {
			server.rawProxy('/proxy');
		}

		const proxyMap = serverConfig.proxy;
		Object.keys(proxyMap)
			.forEach((path) => {
				server.proxy(path, proxyMap[path]);
			});

		let staticFiles = {};
		for (const entity of this._config.include) {
			if (entity.static) {
				staticFiles = Object.assign(staticFiles, entity.static);
			}
		}

		logger.silly(`Serving static files: \n${JSON.stringify(staticFiles, null, '\t')}`);

		for (const [customPath, filePath] of Object.entries(staticFiles)) {
			const alias = `/${customPath.replace(/^\//, '')}`;
			const absolutePath = this._pathHelper.resolveAbsolutePath(filePath);

			if (fs.existsSync(absolutePath)) {
				server.serveStatic(alias, absolutePath);
			} else {
				logger.warn(`Can't serve static path ${kleur.green(alias)} from ${kleur.underline(absolutePath)}`);
			}
		}

		this._codeSource.watch();

		server.start(serverConfig.port)
			.then((addresss) => {
				logger.output(`Server started at ${kleur.underline(addresss)}`);
			}, (err) => {
				logger.error(`Error starting server: ${err.toString()}`);
				logger.debug(err.stack);
			});
	}

	/**
	 * TODO: rename options (here and in template) to be consistent with config naming
	 * Renders index.html adding all the entities included in config
	 * @param {{
	 *     inlineScripts: (Array<string>|undefined),
	 *     inlineStyles: (Array<string>|undefined),
	 *     scripts: (Array<string>|undefined),
	 *     styles: (Array<string>|undefined),
	 *     modules: (Array<string>|undefined)
	 * }=} options
	 * @return {string}
	 */
	getIndexHTMLContent(options = {}) {
		logger.verbose(`Rendering index.html`);

		const defaultOptions = {
			inlineScripts: [],
			inlineStyles: [],
			scripts: [],
			styles: [],
			modules: []
		};
		const opts = Object.assign(defaultOptions, options);

		logger.silly(`External js scripts: \n\t${opts.scripts.join('\n\t')}`);
		logger.silly(`Inlined css files: \n\t${opts.styles.join('\n\t')}`);

		return this._templateHelper.render('index.html.tpl', opts);
	}

	/**
	 * @param {AbstractPlatform=} platform
	 * @return {{
	 *     inlineScripts: Array<string>,
	 *     inlineStyles: Array<string>,
	 *     scripts: Array<string>,
	 *     styles: Array<string>
	 * }}
	 */
	async collectResourcesFromConfigByPlatform(platform = undefined) {
		let platformFilter = () => true;
		if (platform) {
			const otherIncludes = this.getPlatforms()
				.filter((otherPlatform) => otherPlatform !== platform)
				.map((otherPlatform) => otherPlatform.getConfig().include || [])
				.reduce((all, other) => all.concat(other), []);

			platformFilter = (entity) => {
				const shouldExclude = otherIncludes.includes(entity);
				if (shouldExclude) {
					logger.debug(
						`Include entity "${entity.name}" was not included because ` +
						`it came from a platform that is not ${platform.getName()}`
					);
				}
				return !shouldExclude;
			};
		}

		const inlineScriptFiles = [];
		const options = {
			scripts: [],
			inlineScripts: [],
			styles: [],
			inlineStyles: []
		};
		for (const entity of this._config.include.filter(platformFilter)) {
			inlineScriptFiles.push(...(entity.inlineScripts || []));
			// Not adding modules because those were added to compilation
			options.scripts.push(...(entity.externalScripts || []));
			// Not adding css either – they go through PostCSS
			options.styles.push(...(entity.externalCss || []));
		}

		logger.silly(`Inlined js scripts: \n\t${inlineScriptFiles.join('\n\t')}`);

		options.inlineScripts = await Promise.all(inlineScriptFiles
			.map((filename) => this._pathHelper.resolveAbsolutePath(filename))
			.filter((filename) => {
				const exists = fse.exists(filename);
				if (!exists) {
					logger.warn(`File ${kleur.underline(filename)} does not exist`);
				}
				return exists;
			})
			.map((filename) => fse.readFile(filename, 'utf8')));

		return options;
	}

	/**
	 * @param {Array<string|AbstractAddon>=} customAddons
	 * @protected
	 */
	async _initAddons(customAddons) {
		await this._addonLoader.loadFromPackageJson(this.getAppPackageJson());

		if (customAddons) {
			await this._loadCustomAddons(customAddons);
		}

		this._addonLoader.getAddons().forEach((addon) => {
			addon.setTemplateHelper(this._templateHelper);
		});
	}

	/**
	 * @param {Array<string|Object>} customConfigs
	 * @protected
	 */
	async _initConfigs(customConfigs) {
		const defaultConfigPath = path.join(this._pathHelper.getInstalledZbPath(), 'lib', 'config', 'default.js');
		await this._config.loadFile(defaultConfigPath);

		this._addonLoader.getAddons().forEach((addon) => {
			this._config.appendObject(addon.getConfig());
		});

		const projectConfigPath = path.join(this._pathHelper.getRootDir(), 'config.js');

		if (fs.existsSync(projectConfigPath)) {
			await this._config.loadFile(projectConfigPath);
		} else {
			logger.debug(`Default application config does not exist at ${kleur.underline(projectConfigPath)}`);
		}

		await this._loadCustomConfigs(customConfigs);

		this._applyBuiltinDefines();

		const configErrors = this._config.validateSchema();
		if (configErrors.length) {
			configErrors.forEach((error) => {
				logger.warn(`Config error: Property ${error.property}: ${error.message}`);
			});
			throw new Error('Invalid project configuration');
		}

		logger.verbose(`Finalized config`);
	}

	/**
	 * @param {Array<string|AbstractAddon>} addons
	 * @protected
	 */
	async _loadCustomAddons(addons) {
		for (const pathOrAddon of addons) {
			const type = typeof pathOrAddon;

			if (type === 'string') {
				try {
					await this._addonLoader.loadAddon(pathOrAddon);
				} catch (e) {
					logger.debug(e.stack);
					throw new Error(`Can't load addon at "${pathOrAddon}": ${e.toString()}`);
				}
			} else if (type === 'object') {
				this._addonLoader.addAddon(pathOrAddon);
			} else {
				throw new TypeError(
					`Unexpected type "${type}" for addon loading. ` +
					`Pass a string to load addon from the file system or an instance.`
				);
			}
		}
	}

	/**
	 * @param {Array<string|Object>} configs
	 * @protected
	 */
	async _loadCustomConfigs(configs) {
		for (const pathOrObject of configs) {
			const type = typeof pathOrObject;

			if (type === 'string') {
				await this._config.loadFile(pathOrObject);
			} else if (type === 'object') {
				this._config.appendObject(pathOrObject);
			} else {
				throw new TypeError(
					`Unexpected type "${type}" for config loading. ` +
					`Pass a string to load config from the file system or a plain object.`
				);
			}
		}
	}

	/**
	 * @protected
	 */
	_applyBuiltinDefines() {
		const zbVersion = this.getZbPackageJson()['version'];

		this._config.appendObject({
			define: {
				'NPM_PACKAGE_NAME': this._packageJson['name'],
				'NPM_PACKAGE_VERSION': this._packageJson['version'],
				'ZOMBIEBOX_VERSION': zbVersion
			}
		});
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

		this._addonLoader.getExtensions().forEach((extension) => {
			extension.setCodeSource(this._codeSource);
		});
	}

	/**
	 * @protected
	 */
	_checkVersions() {
		logger.verbose(`Cross-checking ZombieBox packages dependencies`);
		const packages = [this.getAppPackageJson(), this.getZbPackageJson(), ...this._addonLoader.getPackageJsons()];

		const checker = new VersionsChecker(this.getAppPackageJson(), packages);
		const {warns, errors} = checker.check();

		warns.forEach((message) => logger.warn(message));

		if (errors.length) {
			throw new Error(errors.join('\n\n'));
		}
	}

	/**
	 * @param {string} file
	 * @param {AbstractPlatform} platform
	 * @return {Promise}
	 * @protected
	 */
	async _runBuildHook(file, platform) {
		if (!await fse.pathExists(file)) {
			return;
		}

		const buildDir = this._pathHelper.getDistDir({
			baseDir: this._config.project.dist,
			version: this.getAppVersion(),
			platformName: platform.getName()
		});

		const externalCallback = (await import(file)).default;
		await new Promise((resolve) => {
			externalCallback(resolve, {
				app: this,
				buildDir,
				platform: platform,
				platformName: platform.getName()
			});
		});
	}
}


export default Application;
