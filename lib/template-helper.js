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
const klawSync = require('klaw-sync');
const path = require('path');
const _ = require('lodash');


/**
 */
class TemplateHelper {
	/**
	 * @param {function(): Array<string>} locationsGetter
	 * @param {function(Object)=} dataPatcher
	 */
	constructor(locationsGetter, dataPatcher = () => {/* Noop */}) {
		/**
		 * @type {function(): Array<string>}
		 * @protected
		 */
		this._getLocations = locationsGetter;

		/**
		 * @type {function(Object)}
		 * @protected
		 */
		this._dataPatcher = dataPatcher;
	}

	/**
	 * @param {string} filename
	 * @param {Object} data
	 * @return {string}
	 */
	render(filename, data) {
		this._patchData(data);

		const template = fs.readFileSync(this._findTemplate(filename), 'utf-8');

		return _.template(template)(data);
	}

	/**
	 * @param {string} templatePath
	 * @param {string} dst
	 * @param {Object} data
	 */
	renderDir(templatePath, dst, data) {
		this._patchData(data);

		fse.ensureDirSync(dst);
		const src = this._findTemplate(templatePath);
		const templateRoot = path.join(src, 'root');
		const renameConfig = require(path.join(src, 'rename.json')); // eslint-disable-line global-require

		klawSync(templateRoot, {nodir: true})
			.forEach((templateFile) => {
				const templateName = path.relative(templateRoot, templateFile.path);

				let targetName = templateName.replace(/\.tpl$/, '');
				targetName = renameConfig.hasOwnProperty(targetName) ?
					_.template(renameConfig[targetName])(data) :
					targetName;
				const targetPath = path.join(dst, targetName);

				if (templateFile.stats.isFile()) {
					if (path.extname(templateFile.path) === '.tpl') {
						fs.writeFileSync(targetPath, this.render(templateFile.path, data), 'utf-8');
					} else {
						fse.copySync(templateFile.path, targetPath);
					}
				} else if (templateFile.stats.isSymbolicLink()) {
					const linkPath = fs.readlinkSync(templateFile.path);
					fs.symlinkSync(linkPath, targetPath);
				}
			});
	}

	/**
	 * @param {Object} data
	 * @private
	 */
	_patchData(data) {
		if (this._dataPatcher) {
			this._dataPatcher(data);
		}
	}

	/**
	 * @param {string} filename
	 * @return {string}
	 * @private
	 */
	_findTemplate(filename) {
		const locations = this._getLocations();
		if (path.isAbsolute(filename) && fs.existsSync(filename)) {
			return filename;
		}

		for (let i = 0; i < locations.length; i++) {
			const templatePath = path.join(locations[i], filename);
			if (fs.existsSync(templatePath)) {
				return templatePath;
			}
		}

		throw new Error(`Can't find template: ${filename} in [ ${locations.join(', ')} ]`);
	}
}


module.exports = TemplateHelper;
