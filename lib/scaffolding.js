/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const _ = require('lodash');
const path = require('path');
const kleur = require('kleur');
const TemplateHelper = require('./template-helper');
const logger = require('./logger').createChild('Scaffolding');


/**
 */
class Scaffolding {
	/**
	 * @param {TemplateHelper} templateHelper
	 */
	constructor(templateHelper) {
		this._templateHelper = templateHelper;
	}

	/**
	 * @param {string} name
	 * @param {string} componentName
	 * @param {string} parentDir
	 */
	addScene(name, componentName, parentDir) {
		this._addComponent('scene', name, componentName, parentDir);
	}

	/**
	 * @param {string} name
	 * @param {string} componentName
	 * @param {string} parentDir
	 */
	addPopup(name, componentName, parentDir) {
		this._addComponent('popup', name, componentName, parentDir);
	}

	/**
	 * @param {string} name
	 * @param {string} componentName
	 * @param {string} parentDir
	 */
	addWidget(name, componentName, parentDir) {
		this._addComponent('widget', name, componentName, parentDir);
	}

	/**
	 * @param {string} type
	 * @param {string} name
	 * @param {string} componentName
	 * @param {string} parentDir
	 * @protected
	 */
	_addComponent(type, name, componentName, parentDir) {
		const slug = _.kebabCase(name);
		const componentPath = path.join(parentDir, slug);

		this._templateHelper.renderDir(
			type,
			componentPath,
			{slug, name, componentName}
		);

		logger.output(`${_.upperFirst(type)} ${name} created at ${kleur.underline(componentPath)}`);
	}
}


module.exports = Scaffolding;
