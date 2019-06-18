/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
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
const ClosureCompiler = require('google-closure-compiler').compiler;


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
		const entryPoint = this._application.getGeneratedEntryPoint();
		let aliases = this._application.getAliases();
		let externs = [];

		for (const entity of this._application.getConfig().include) {
			externs = externs.concat(entity.externs || []);
			aliases = Object.assign(aliases, entity.aliases || {});
		}

		const pathHelper = this._application.getPathHelper();
		externs = externs.map((file) => pathHelper.resolveAbsolutePath(file));

		const gccMapString = Array.from(aliases.keys())
			.map((name) => `${name}/=${aliases.get(name)}/`);

		const compilerOptions = mergeConfigs({
			'compilation_level': 'ADVANCED_OPTIMIZATIONS',
			'language_in': 'ECMASCRIPT_2018',
			'language_out': 'ES5',
			'warning_level': 'VERBOSE',
			'charset': 'UTF8',
			'module_resolution': 'BROWSER_WITH_TRANSFORMED_PREFIXES',
			'browser_resolver_prefix_replacements': gccMapString,
			'dependency_mode': 'STRICT',
			'entry_point': entryPoint,
			'summary_detail_level': '3',
			'externs': externs,
			'js': this._application.getCompilationScripts()
		}, flags, this._application.getConfig().gcc);

		const closureCompiler = new ClosureCompiler(compilerOptions);

		return new Promise((resolve, reject) => {
			closureCompiler.run((exitCode, stdout, stderr) => {
				if (exitCode) {
					reject(stderr.replace(/^(.*)\n/, '').trim()); // Discard command part (java -jar ...)
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
	 * @return {Promise<string>}
	 */
	getCompressedStyles(resourcesTargetPath) {
		const styles = this._application.getSortedStyles();
		const postcssConfig = this._application.getConfig().postcss;

		const processor = postcss([
			postcssPresetEnv(Object.assign({}, postcssConfig.presetEnv)),
			...postcssConfig.extraPlugins,
			postcssUrl(Object.assign({}, postcssConfig.url)),
			postcssCsso(Object.assign({}, postcssConfig.csso))
		]);

		const to = path.join(this._application.getPathHelper().resolveAbsolutePath(resourcesTargetPath), 'dummy.file');
		return Promise.all(
			styles.map((stylePath) =>
				fse.readFile(stylePath, 'utf-8')
					.then((content) => processor.process(content, {
						from: stylePath,
						to
					}))
					.then((result) => result.css)
			)
		)
			.then((content) => content.join('\n'));
	}

	/**
	 * @param {string} filename
	 * @return {Promise<string>} Resolved with GCC warnings.
	 */
	writeIndexHTML(filename) {
		const absoluteFilename = this._application.getPathHelper().resolveAbsolutePath(filename);

		return Promise.all([
			this.getCompressedScripts(),
			this.getCompressedStyles(path.dirname(absoluteFilename))
		])
			.then(([compilationResult, compressedStyles]) => {
				const indexHTMLContent = this._application.getIndexHTMLContent({
					inlineScripts: [compilationResult.stdout],
					inlineStyles: [compressedStyles]
				});

				return fse.writeFile(absoluteFilename, indexHTMLContent, 'utf-8')
					.then(() => compilationResult.stderr);
			});
	}

	/**
	 * @param {string} dst
	 */
	copyStaticFiles(dst) {
		const pathHelper = this._application.getPathHelper();
		const absoluteDestination = pathHelper.resolveAbsolutePath(dst);

		let staticFiles = {};
		for (const entity of this._application.getConfig().include) {
			staticFiles = Object.assign(staticFiles, entity.static || {});
		}

		for (const [alias, sourcePath] of Object.entries(staticFiles)) {
			const targetPath = path.join(absoluteDestination, alias);
			const targetDir = path.dirname(targetPath);

			if (!fs.existsSync(targetDir)) {
				fse.ensureDirSync(targetDir);
			}

			fse.copySync(pathHelper.resolveAbsolutePath(sourcePath), targetPath);
		}
	}

	/**
	 * @param {string} dir
	 * @param {Object<string, string>} archiveMap
	 * @return {Object<string, string>}
	 */
	addDirToArchiveMap(dir, archiveMap = {}) {
		klawSync(dir, {nodir: true})
			.forEach((file) => (archiveMap[file.path] = path.relative(dir, file.path)));

		return archiveMap;
	}

	/**
	 * @param {string} filename
	 * @param {Object<string, string>} files
	 * @return {Promise}
	 */
	writeZIPArchive(filename, files) {
		const output = fs.createWriteStream(filename);
		const archive = archiver('zip');

		const promise = new Promise((resolve, reject) => {
			output.on('finish', () => {
				resolve(archive.pointer());
			});

			output.on('error', (err) => {
				reject(err);
			});
		});

		archive.pipe(output);

		Object.keys(files)
			.forEach((src) => {
				const stat = fs.lstatSync(src);
				if (stat.isSymbolicLink()) {
					console.warn(`Skip symlink ${src}.`);

					// Symlinks not supported in archiver api :'(
					return;
				}

				archive.append(fs.createReadStream(src), {
					name: files[src],
					stats: stat
				});
			});

		archive.finalize();

		return promise;
	}
}


module.exports = BuildHelper;
