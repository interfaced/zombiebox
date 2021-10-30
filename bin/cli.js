#!/usr/bin/env node

/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import path from 'path';
import fs from 'fs';
import kleur from 'kleur';
import _ from 'lodash';
import Yargs from 'yargs';
import {hideBin} from 'yargs/helpers'
import {findPackageJson} from '../lib/utils.js';
import Application from '../lib/application.js';
import TemplateHelper from '../lib/template-helper.js';
import Scaffolding from '../lib/scaffolding.js';
import {rootLogger, createChild} from '../lib/logger.js';
const logger = createChild('CLI');


/**
 */
class CLI {
	/**
	 */
	constructor() {
		/**
		 * @type {?Application}
		 * @protected
		 */
		this._application = null;

		/**
		 * @type {TemplateHelper}
		 * @protected
		 */
		this._templateHelper = new TemplateHelper(
			() => {
				let locations = [path.resolve(__dirname, '../templates')];
				if (this._application) {
					locations = locations.concat(this._application.getPathHelper().getTemplateLocations());
				}
				logger.silly(`Template locations: \n\t${locations.join('\n\t')}`);
				return locations;
			}, (data) => {
				data._ = _;
				data.config = this._application ? this._application.getConfig() : null;
			}
		);

		/**
		 * @type {Scaffolding}
		 * @protected
		 */
		this._scaffolding = new Scaffolding(this._templateHelper);

		this._setupYargs();
	}

	/**
	 * Prepare app and start developer mode HTTP server.
	 */
	run() {
		logger.verbose(`Starting dev server`);
		this._assertApplication();

		this._application.ready()
			.then(() => this._application.serve());
	}

	/**
	 * Build code and exit
	 */
	buildCode() {
		logger.verbose(`Building generated application code`);
		this._assertApplication();

		this._application.ready()
			.then(() => this._application.buildCode());
	}

	/**
	 * @param {string} target Platform name
	 */
	build(target) {
		logger.verbose(`Building application for ${target}`);
		this._assertApplication();

		const platform = this._application.getPlatformByName(target);

		this._application.ready()
			.then(() => this._application.build(platform))
			.catch((e) => {
				if (e instanceof Error) {
					logger.error(e.toString());
					logger.debug(e.stack);
				} else {
					logger.error(e);
				}
				process.exit(2);
			});
	}

	/**
	 * @param {string} target Platform name
	 */
	pack(target) {
		logger.verbose(`Packing application for ${target}`);
		this._assertApplication();

		const platform = this._application.getPlatformByName(target);

		this._application.ready()
			.then(() => this._application.pack(platform))
			.catch((e) => {
				if (e instanceof Error) {
					logger.error(e.toString());
					logger.debug(e.stack);
				} else {
					logger.error(e);
				}
				process.exit(2);
			});
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addScene(name, path) {
		logger.verbose(`Generating scene ${name} at ${path}`);
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addScene(name, appName, path);
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addPopup(name, path) {
		logger.verbose(`Generating popup ${name} at ${path}`);
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addPopup(name, appName, path);
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addWidget(name, path) {
		logger.verbose(`Generating widget ${name} at ${path}`);
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addWidget(name, appName, path);
	}

	/**
	 * @param {string} target
	 */
	generateAliases(target) {
		logger.verbose(`Generating aliases map in ${target}`);
		this._assertApplication();

		this._application.ready().then(() => {
			const filename = path.resolve(process.cwd(), target);

			const map = {};
			for (const [key, value] of this._application.getAliases()) {
				map[key] = value;
			}

			logger.debug(`Aliases: \n${JSON.stringify(map, null, '\t')}`);
			const content = this._templateHelper.render('webpack.config.js.tpl', {map});

			fs.writeFile(filename, content, 'utf8', (error) => {
				if (error) {
					logger.error(`Error writing aliases map: ${error.message}`);
					process.exit(1);
				} else {
					logger.output(`Aliases map generated in ${kleur.underline(filename)}`);
				}
			});
		});
	}

	_createYargsParserWithBaseOptions() {
		/* eslint-disable newline-per-chained-call */
		return Yargs(hideBin(process.argv))
			.help(false)
			.array('config').default('config', [])
			.array('addon').default('addon', [])
			.string('log-level')
			.alias('log-level', 'l')
			.default('log-level', 'info')
			.choices('log-level', Object.keys(logger.levels));
	}

	_createApplicationFromArgv() {
		const argv = this._createYargsParserWithBaseOptions().parse();

		rootLogger.level = argv.logLevel;

		// @see {https://github.com/yargs/yargs/issues/1336}
		const configs = Array.isArray(argv.config) ?
			argv.config.reduce((flat, value) => flat.concat(value), []) :
			[argv.config];

		return this._createApplication(configs, argv.addon);
	}

	/**
	 * @return {Yargs}
	 * @protected
	 */
	async _setupYargs() {
		// Disable built-in help to prevent early processing and unexpected process end.
		// Will be enabled before the last argv call.

		const app = this._createApplicationFromArgv();
		const buildTargets = [];
		let projectConfig = null;

		const yargs = this._createYargsParserWithBaseOptions();

		if (app) {
			await app.ready();
			projectConfig = app.getConfig().project;
			const platforms = app.getPlatforms();

			logger.silly(`Application supports platforms: ${platforms.map((p) => p.getName()).join(', ')}`);

			platforms.forEach((platform) => {
				buildTargets.push(platform.getName());
				yargs.command(
					platform.getName(),
					`${platform.getName()} platform CLI commands`,
					(yargs) => platform.buildCLI(yargs, app)
				);
			});
		} else {
			logger.debug(`Application was not created, running without it`);
		}

		return yargs
			.command('run', 'Start development server', (yargs) => this.run(yargs))
			.command(
				'generateAliases [filename]',
				'Generate webpack config file with aliases map',
				(yargs) => {
					yargs.positional('filename', {
						describe: 'file path',
						default: 'webpack.config.js'
					});
				},
				(argv) => this.generateAliases(argv.filename)
			)
			.command('buildCode', 'Generate lifecycle code', (yargs) => this.buildCode(yargs))
			.command(
				'build <platform>',
				'Build artifact for specific platform',
				(yargs) => {
					yargs.positional('platform', {
						describe: 'platform name',
						choices: buildTargets
					});
				},
				(argv) => this.build(argv.platform)
			)
			.command(
				'pack <platform>',
				'Pack artifact for specific platform',
				(yargs) => {
					yargs.positional('platform', {
						describe: 'platform name',
						choices: buildTargets
					});
				},
				(argv) => this.pack(argv.platform)
			)
			.command(
				'init <name> [root]',
				'Initialize ZombieBox application boilerplate',
				(yargs) => {
					yargs
						.positional('name', {
							describe: 'project name'
						}).positional('root', {
							describe: 'root directory',
							default: process.cwd()
						});
				},
				(argv) => this.init(argv.name, argv.root)
			)
			.command(
				'addScene <name> [path]',
				'Create a Scene boilerplate',
				(yargs) => {
					yargs
						.positional('name', {
							describe: 'name'
						})
						.positional('path', {
							describe: 'parent directory',
							default: projectConfig ? path.resolve(projectConfig.src, 'scenes') : undefined
						});
				},
				(argv) => this.addScene(argv.name, argv.path)
			)
			.command(
				'addPopup <name> [path]',
				'Create a Popup boilerplate',
				(yargs) => {
					yargs
						.positional('name', {
							describe: 'name'
						})
						.positional('path', {
							describe: 'parent directory',
							default: projectConfig ? path.resolve(projectConfig.src, 'popups') : undefined
						});
				},
				(argv) => this.addPopup(argv.name, argv.path)
			)
			.command(
				'addWidget <name> [path]',
				'Create a Widget boilerplate',
				(yargs) => {
					yargs
						.positional('name', {
							describe: 'name'
						})
						.positional('path', {
							describe: 'parent directory',
							default: projectConfig ? path.resolve(projectConfig.src, 'widgets') : undefined
						});
				},
				(argv) => this.addWidget(argv.name, argv.path)
			)
			.demandCommand(1, 1, 'No command specified')
			.recommendCommands()
			.strict(true)
			.help()
			.parse();

		/* eslint-enable newline-per-chained-call */
	}

	/**
	 * @param {string} name
	 * @param {string} root
	 * @protected
	 */
	init(name, root) {
		logger.verbose(`Creating boilerplate application "${name}" in ${root}`);

		this._templateHelper.renderDir('boilerplate', root, {
			name
		});

		logger.output(`Boilerplate ZombieBox application "${name}" created at ${root}`);
	}

	/**
	 * @param {Object|string} rawConfigs
	 * @param {string} rawAddons
	 * @return {?Application}
	 * @protected
	 */
	_createApplication(rawConfigs, rawAddons) {
		if (this._application) {
			return this._application;
		}

		logger.silly(
			`Trying to instantiate Application` +
			(rawConfigs.length ? `\n\tConfigs: ${rawConfigs.join(', ')}` : '') +
			(rawAddons.length ? `\n\tAddons: ${rawAddons.join(', ')}` : '')
		);

		const packageJson = findPackageJson(
			process.cwd(),
			(packageJson) => packageJson.dependencies && packageJson.dependencies.hasOwnProperty('zombiebox')
		);

		logger.debug(`Application package.json path: ${kleur.underline(packageJson)}`);

		if (!packageJson) {
			return null;
		}

		const configs = rawConfigs.map((fileOrObject) => {
			if (typeof fileOrObject === 'string') {
				return path.resolve(fileOrObject);
			}
			return fileOrObject;
		});

		const addons = rawAddons.map((file) => path.resolve(file));

		try {
			this._application = new Application(path.dirname(packageJson), configs, addons);
		} catch (e) {
			logger.warn(
				`Could not create Application instance, ` +
				`CLI commands that require it will not work: ${e.toString()}`
			);
			logger.debug(e.stack);
		}
		return this._application;
	}

	/**
	 * @protected
	 */
	_assertApplication() {
		if (!this._application) {
			logger.error('Cannot execute this command without application');
			process.exit(1);
		}
	}
}


new CLI();
