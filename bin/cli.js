#!/usr/bin/env node

/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const yargs = require('yargs');
const {findPackageJson} = require('../lib/utils');
const Application = require('../lib/application');
const TemplateHelper = require('../lib/template-helper');
const Scaffolding = require('../lib/scaffolding');


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
				return locations;
			}
		);

		/**
		 * @type {Scaffolding}
		 * @private
		 */
		this._scaffolding = new Scaffolding(this._templateHelper);

		this._setupYargs();
	}

	/**
	 * Prepare app and start developer mode HTTP server.
	 */
	run() {
		this._assertApplication();

		this._application.ready()
			.then(() => this._application.serve());
	}

	/**
	 * Build code and exit
	 */
	buildCode() {
		this._assertApplication();

		this._application.ready()
			.then(() => this._application.buildCode());
	}

	/**
	 * @param {Array<string>} targets Platform names.
	 */
	build(targets) {
		this._assertApplication();

		const platformsToCompile = this._application.getPlatforms().filter((platform) =>
			targets.includes(platform.getName()) || targets.includes('all')
		);

		this._application.ready()
			.then(() => this._application.compile(platformsToCompile));
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addScene(name, path) {
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addScene(name, appName, path);
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addPopup(name, path) {
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addPopup(name, appName, path);
	}

	/**
	 * @param {string} name
	 * @param {string} path
	 */
	addWidget(name, path) {
		this._assertApplication();

		const appName = this._application.getConfig().project.name;
		this._scaffolding.addWidget(name, appName, path);
	}

	/**
	 * @param {string} target
	 */
	generateAliases(target) {
		this._assertApplication();

		this._application.ready().then(() => {
			const filename = path.resolve(process.cwd(), target);

			const map = {};
			for (const [key, value] of this._application.getAliases()) {
				map[key] = value;
			}
			const content = this._templateHelper.render('webpack.config.js.tpl', {map});

			fs.writeFile(filename, content, 'utf8', (error) => {
				if (error) {
					console.error('Error writing aliases map:', error.message);
					process.exit(1);
				} else {
					console.log('Aliases map generated in', chalk.cyan(filename));
				}
			});
		});
	}

	/**
	 * @return {Yargs}
	 * @protected
	 */
	_setupYargs() {
		/* eslint-disable newline-per-chained-call */
		yargs
			.array('config').default('config', [])
			.array('addon').default('addon', []);

		// @see {https://github.com/yargs/yargs/issues/1336}
		const configs = Array.isArray(yargs.argv.config) ?
			yargs.argv.config.reduce((flat, value) => flat.concat(value), []) :
			[yargs.argv.config];

		const app = this._createApplication(configs, yargs.argv.addon);
		const buildTargets = ['all'];
		let projectConfig = null;

		if (app) {
			projectConfig = app.getConfig().project;
			app.getPlatforms()
				.forEach((platform) => {
					buildTargets.push(platform.getName());
					yargs.command(
						platform.getName(),
						`${platform.getName()} platform CLI commands`,
						(yargs) => platform.buildCLI(yargs, app)
					);
				});
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
				'build <platform..>',
				'Build artifact for one or several platforms',
				(yargs) => {
					yargs.positional('platform', {
						describe: 'platform name(s)',
						choices: buildTargets
					});
				},
				(argv) => this.build(argv.platform)
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
				(yargv) => this.init(yargv.name, yargv.root)
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
			.argv;

		/* eslint-enable newline-per-chained-call */
	}

	/**
	 * @param {string} name
	 * @param {string} root
	 * @protected
	 */
	init(name, root) {
		const data = {
			name
		};

		this._templateHelper.renderDir('boilerplate', root, data);

		console.log(`Boilerplate ZombieBox application ${name} created at`, root);
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

		const packageJson = findPackageJson(
			process.cwd(),
			(packageJson) => packageJson.dependencies && packageJson.dependencies.hasOwnProperty('zombiebox')
		);

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
			console.error(e.message);
			console.warn('Failed to create ZombieBox Application instance. CLI functionality will be limited');
		}
		return this._application;
	}

	/**
	 * @protected
	 */
	_assertApplication() {
		if (!this._application) {
			console.error('Could not find ZombieBox application');
			process.exit(1);
		}
	}
}


/**
 * @typedef {{
 *     argv: Array<*>
 * }}
 */
let Yargs;


new CLI();
