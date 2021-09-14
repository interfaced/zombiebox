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


/**
 * Find package.json location path up from startLocation.
 * @param {string} startLocation
 * @param {function(Object): boolean} constraint
 * @return {?string}
 */
const findPackageJson = (startLocation = process.cwd(), constraint = () => true) => {
	const {root} = path.parse(startLocation);
	let cwd = startLocation;
	while (cwd !== root) {
		const packageJsonPath = path.join(cwd, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			if (constraint(require(packageJsonPath))) { // eslint-disable-line node/global-require
				return packageJsonPath;
			}
		}

		cwd = path.dirname(cwd);
	}
	return null;
};


/**
 * Merge config objects. Modifies target and returns it
 * @param {Object} target
 * @param {...Object} sources
 * @return {Object}
 */
const mergeConfigs = (target, ...sources) => {
	for (const source of sources) {
		for (const [key, value] of Object.entries(source)) {
			if (!target.hasOwnProperty(key)) {
				target[key] = value;
				continue;
			}

			const targetValue = target[key];

			const targetValueIsArray = targetValue instanceof Array;
			const sourceValueIsArray = value instanceof Array;
			const targetValueIsObject = !targetValueIsArray && targetValue instanceof Object;
			const sourceValueIsObject = !sourceValueIsArray && source[key] instanceof Object;

			if (targetValueIsArray && sourceValueIsArray) {
				target[key] = targetValue.concat(value.filter((e) => !targetValue.includes(e)));
				continue;
			}

			if (targetValueIsObject && sourceValueIsObject) {
				target[key] = mergeConfigs(targetValue, value);
				continue;
			}

			if (targetValueIsObject && sourceValueIsArray || targetValueIsArray && sourceValueIsObject) {
				throw new Error(`Cannot merge config field ${key}: values are of different non-primitive types`);
			}

			target[key] = value;
		}
	}

	return target;
};


module.exports = {
	findPackageJson,
	mergeConfigs
};
