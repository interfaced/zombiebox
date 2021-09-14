const tmp = require('tmp');
const path = require('path');
const fse = require('fs-extra');


const zombieboxRoot = path.resolve(__dirname, '..', '..');
const boilerplate = path.resolve(__dirname, 'fixtures', 'application');

const Application = require('../../lib/application');


/**
 */
class TemporaryApplicationContainer {
	/**
	 */
	constructor() {
		/**
		 * @type {string}
		 * @private
		 */
		this._root;
	}

	/**
	 * @return {Promise<string>}
	 */
	async init() {
		tmp.setGracefulCleanup();

		const tmpDir = tmp.dirSync({
			prefix: 'zombiebox-tools-test-',
			keep: false,
			unsafeCleanup: true
		});

		this._root = tmpDir.name;

		const nodeModules = path.resolve(this._root, 'node_modules');

		await fse.mkdir(nodeModules);
		await this.installDependency('zombiebox', zombieboxRoot);
		await this.installDependency(
			'zombiebox-platform-pc',
			path.dirname(require.resolve('zombiebox-platform-pc/package.json')),
			true
		);
		// eslint-disable-next-line node/global-require
		const pcPackageJson = require('zombiebox-platform-pc/package.json');
		for (const pcDependency of Object.keys(pcPackageJson['dependencies'])) {
			await this.installDependency(
				pcDependency,
				path.dirname(require.resolve(pcDependency + '/package.json'))
			);
		}

		await fse.copy(boilerplate, this._root);
	}

	/**
	 * @return {Promise}
	 */
	async cleanup() {
		await fse.remove(this._root);
	}

	/**
	 * @param {string} name
	 * @param {string} source
	 * @param {boolean} copy
	 * @return {Promise}
	 */
	async installDependency(name, source, copy = false) {
		const target = path.resolve(this._root, 'node_modules', name);

		if (copy) {
			await fse.copy(source, target);
		} else {
			await fse.symlink(source, target, 'junction');
		}
	}

	/**
	 * @param {...?} args
	 * @return {Application}
	 */
	createZbApplication(...args) {
		return new Application(this._root, ...args);
	}

	/**
	 * @param {string} file
	 * @return {string}
	 */
	getFilePath(file) {
		return path.resolve(this._root, file);
	}

	/**
	 * @param {string} file
	 * @param {string} encoding
	 * @return {Promise<string>}
	 */
	async readFile(file, encoding = 'utf-8') {
		return fse.readFile(this.getFilePath(file), encoding);
	}

	/**
	 * @param {string} file
	 * @param {string} encoding
	 * @return {Promise<string>}
	 */
	async writeFile(file, encoding = 'utf-8') {
		return fse.writeFile(this.getFilePath(file), encoding);
	}
}


module.exports = TemporaryApplicationContainer;
