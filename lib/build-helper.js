/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const klawSync = require('klaw-sync');
const {mergeConfigs} = require('./utils');
const archiver = require('archiver');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const postcssCsso = require('postcss-csso');
const postcssUrl = require('postcss-url');
const postcssImport = require('postcss-import');
const ClosureCompiler = require('google-closure-compiler').compiler;
const Application = require('./application');
const PathHelper = require('./path-helper');
const logger = require('./logger').createChild('Build');
const kleur = require('kleur');


/**
 */
class BuildHelper {
	/**
	 * @param {Application} application
	 */
	constructor(application) {
		/**
		 * @type {Application}
		 * @protected
		 */
		this._application = application;
	}

	/**
	 * @param {Object} flags
	 * @return {Promise<{stderr: string, stdout: string}>}
	 */
	getCompressedScripts(flags = {}) {
		logger.verbose('Starting compilation');
		const entryPoint = this._application.getGeneratedEntryPoint();
		logger.silly(`Application entry point: ${entryPoint}`);

		let aliases = this._application.getAliases();
		let externs = [];

		for (const entity of this._application.getConfig().include) {
			externs = externs.concat(entity.externs || []);
			aliases = Object.assign(aliases, entity.aliases || {});
		}

		const pathHelper = this._application.getPathHelper();
		externs = externs.map((file) => pathHelper.resolveAbsolutePath(file));

		logger.silly(`Externs: \n\t${externs.join('\n\t')}`);

		const gccMapString = Array.from(aliases.keys())
			.map((name) => `${name}/=${aliases.get(name)}/`);

		const compilerOptions = mergeConfigs({
			'compilation_level': 'ADVANCED_OPTIMIZATIONS',
			'language_in': 'ECMASCRIPT_2019',
			'language_out': 'ES5',
			'warning_level': 'VERBOSE',
			'error_format': 'JSON',
			'charset': 'UTF8',
			'module_resolution': 'BROWSER_WITH_TRANSFORMED_PREFIXES',
			'browser_resolver_prefix_replacements': gccMapString,
			'dependency_mode': 'PRUNE',
			'entry_point': entryPoint,
			'summary_detail_level': '3',
			'externs': externs,
			'js': this._application.getCompilationScripts()
		}, flags, this._application.getConfig().gcc);

		logger.debug(`GCC flags: ${JSON.stringify(compilerOptions, (key, value) => {
			if (key === 'js' || key === 'externs') {
				return ['<truncated>'];
			}
			return value;
		}, '\t')}`);

		const closureCompiler = new ClosureCompiler(compilerOptions);

		return new Promise((resolve) => {
			logger.debug('Running Google Closure Compiler');
			closureCompiler.run((exitCode, stdout, stderr) => {
				logger.silly(`GCC exited with ${exitCode}`);
				if (exitCode) {
					resolve({
						stdout,
						stderr: stderr.replace(/^(.*)\n/, '').trim()// Discard command part (java -jar ...)
					});
				} else {
					resolve({
						stdout,
						stderr: stderr.trim()
					});
				}
			});
		});
	}

	/**
	 * @param {string} resourcesTargetPath
	 * @return {Promise<{
	 *     css: string,
	 *     messages: Array<Object>
	 * }>}
	 */
	async getCompressedStyles(resourcesTargetPath) {
		const allStyles = this._application.getSortedStyles();
		const postcssConfig = this._application.getConfig().postcss;
		const to = path.join(this._application.getPathHelper().resolveAbsolutePath(resourcesTargetPath), 'dummy.file');

		const prepareProcessor = postcss([
			postcssPresetEnv({...postcssConfig.presetEnv}),
			...postcssConfig.filePlugins,
			postcssUrl({...postcssConfig.url})
		]);

		const importBundleProcessor = postcss([
			postcssImport({
				resolve: (id) => {
					if (PathHelper.isLocal(id)) {
						return id;
					}
					return this._application.aliasedPathToFsPath(id);
				},
				load: (fsPath) => processFile(prepareProcessor, fsPath)
			})
		]);

		const finalProcessor = postcss([
			...postcssConfig.bundlePlugins,
			postcssCsso({...postcssConfig.csso})
		]);

		const processFile = async (processor, fsPath) => {
			const pluginNames = processor.plugins.map((plugin) => plugin && plugin.postcssPlugin).join(', ');
			logger.silly(`Running ${kleur.cyan(pluginNames)} on ${kleur.underline(fsPath)}`);
			const content = await fse.readFile(fsPath, 'utf-8');
			const result = await processor.process(content, {from: fsPath, to});
			return result.css;
		};

		let bundle;
		if (postcssConfig.importEntryPoints) {
			bundle = (await Promise.all(
				postcssConfig.importEntryPoints.map(async (fsPath) => processFile(importBundleProcessor, fsPath))
			)).join('\n');
		} else {
			bundle = (await Promise.all(
				allStyles.map((fsPath) => processFile(prepareProcessor, fsPath))
			)).join('\n');
		}

		const pluginNames = finalProcessor.plugins.map((plugin) => plugin && plugin.postcssPlugin).join(', ');
		logger.silly(`Running ${kleur.cyan(pluginNames)} on bundle`);
		return finalProcessor.process(bundle, {from: to, to});
	}

	/**
	 * @param {string} dst
	 */
	async copyStaticFiles(dst) {
		const pathHelper = this._application.getPathHelper();
		const absoluteDestination = pathHelper.resolveAbsolutePath(dst);

		let staticFiles = {};
		for (const entity of this._application.getConfig().include) {
			staticFiles = Object.assign(staticFiles, entity.static || {});
		}

		logger.verbose(`Copying static files \n${JSON.stringify(staticFiles, null, '\t')}`);

		await Promise.all(Object.entries(staticFiles).map(async ([alias, sourcePath]) => {
			const targetPath = path.join(absoluteDestination, alias);
			const targetDir = path.dirname(targetPath);

			await fse.ensureDir(targetDir);
			await fse.copy(pathHelper.resolveAbsolutePath(sourcePath), targetPath);
		}));
	}

	/**
	 * @param {string} dir
	 * @param {Object<string, string>} archiveMap
	 * @return {Object<string, string>}
	 */
	addDirToArchiveMap(dir, archiveMap = {}) {
		logger.verbose(`Adding ${dir} to archive`);

		klawSync(dir, {nodir: true})
			.forEach((file) => (archiveMap[file.path] = path.relative(dir, file.path)));

		return archiveMap;
	}

	/**
	 * @param {string} filename
	 * @param {Object<string, string>} files
	 * @return {Promise}
	 */
	async writeZIPArchive(filename, files) {
		logger.verbose(`Writing zip archive ${filename}`);
		logger.silly(`Archive files: ${JSON.stringify(files, null, '\t')}`);

		const output = fs.createWriteStream(filename);
		const archive = archiver('zip');
		archive.pipe(output);

		await Promise.all(Object.keys(files).map(async (src) => {
			const stat = await fse.lstat(src);
			if (stat.isSymbolicLink()) {
				logger.warn(`Skipping symlink ${src}.`);

				// Symlinks not supported in archiver api :'(
				return;
			}

			archive.append(fs.createReadStream(src), {
				name: files[src],
				stats: stat
			});
		}));

		archive.finalize();

		return new Promise((resolve, reject) => {
			output.on('finish', () => {
				resolve(archive.pointer());
			});

			output.on('error', (err) => {
				reject(err);
			});
		});
	}
}


module.exports = BuildHelper;
