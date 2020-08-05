/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/* eslint interfaced/lines-between-props: "off" */
const kleur = require('kleur');
const _ = require('lodash');
const {mergeConfigs} = require('../utils');
const {Validator} = require('jsonschema');
const schema = require('./schema');
const {IZombieBoxConfig} = require('./interface');
const logger = require('../logger').createChild('Config');


/**
 * @implements {IZombieBoxConfig}
 */
class Config {
	/**
	 */
	constructor() {
		/**
		 * @type {IZombieBoxConfig}
		 * @protected
		 */
		this._config = {};

		/**
		 * @type {Validator}
		 * @protected
		 */
		this._validator = new Validator();
	}

	/**
	 * @param {string} src
	 */
	loadFile(src) {
		logger.debug(`Loading config file ${src}`);
		// eslint-disable-next-line node/global-require
		this.appendObject(require(src)(this._config));
	}

	/**
	 * @param {IZombieBoxConfig} childConfig
	 */
	appendObject(childConfig) {
		logger.silly(`Appending config object \n${JSON.stringify(childConfig, null, '\t')}`);

		this._migrate(childConfig);

		const errors = this.validateSchema(childConfig, true);
		errors.forEach((error) => {
			logger.warn(`Config error: Property ${error.property}: ${error.message}`);
		});

		mergeConfigs(this._config, childConfig);

		this._defineGetters();
	}

	/**
	 * @param {string} path
	 * @return {*}
	 */
	getCustomValue(path) {
		return _.get(this._config, path);
	}

	/**
	 * @param {?IZombieBoxConfig} config
	 * @param {boolean} skipRequired
	 * @return {Array}
	 */
	validateSchema(config = this._config, skipRequired = false) {
		const result = this._validator.validate(config, schema, {
			throwError: false
		});

		return result.errors.filter((error) => !skipRequired || error.name !== 'required');
	}

	/**
	 * @param {IZombieBoxConfig} newConfig
	 * @protected
	 */
	_migrate(newConfig) {
		for (const [oldKey, newKey] of Object.entries(DEPRECATED_KEYS)) {
			const [key, type] = oldKey.split(':');

			if (_.has(newConfig, key)) {
				const value = _.get(newConfig, key);

				if (type) {
					const typeMatcher = _[`is${type}`];

					// Skip when type doesn't match
					if (typeMatcher && !typeMatcher(value)) {
						continue;
					}
				}

				logger.warn(
					`Configuration key ${kleur.bold(key)}` +
					`${type ? ` with type ${kleur.bold(type)} ` : ' '}` +
					`is deprecated, use ${kleur.bold(newKey)} instead`
				);

				// Move the value to the new key
				_.set(newConfig, newKey, value);
				_.unset(newConfig, key);
			}
		}
	}

	/**
	 * @protected
	 */
	_defineGetters() {
		for (const key of Object.keys(this._config)) {
			if (this.hasOwnProperty(key)) {
				continue;
			}

			Object.defineProperty(
				this,
				key,
				{
					get: () => this._config[key]
				}
			);
		}
	}
}


/**
 * Pairs of the "deprecated:new" keys. A deprecated key may have :<type> postfix to match a specific type
 * @type {Object<string, string>}
 */
const DEPRECATED_KEYS = {
	'postcss.extraPlugins': 'postcss.filePlugins'
};


module.exports = Config;
