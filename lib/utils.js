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
import {createRequire} from 'module';
import {readFile} from 'fs/promises';

/**
 * Find package.json location path up from startLocation.
 * @param {string} startLocation
 * @param {function(Object): boolean} constraint
 * @return {?string}
 */
export const findPackageJson = (startLocation = process.cwd(), constraint = () => true) => {
	const {root} = path.parse(startLocation);
	let cwd = startLocation;
	while (cwd !== root) {
		const packageJsonPath = path.join(cwd, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			const json = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
			if (constraint(json)) {
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
export const mergeConfigs = (target, ...sources) => {
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

/**
 * @param {string} baseUrl
 * @param {string} path
 * @returns {Promise<*>}
 */
export const loadJSON = async (baseUrl, path) => JSON.parse(await readFile(new URL(path, baseUrl), 'utf-8'));

/**
 * Usage: utils.resolve(import.meta.url, 'lib');
 * @param {string} baseUrl
 * @param {string=} path
 * @return {string}
 */
export const resolve = (baseUrl, path = '.') => (new URL(path, baseUrl)).pathname;

/**
 * Usage: utils.resolveNPMModule(import.meta.url, 'hls.js');
 * @param {string} baseUrl
 * @param {string} moduleName
 * @param {Object=} opts
 * @return {string}
 */
export const resolveNPMModule = (baseUrl, moduleName, opts) => createRequire(baseUrl).resolve(moduleName, opts);