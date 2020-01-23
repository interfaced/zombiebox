/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 */
export default class UnsupportedFeature extends Error {
	/**
	 * @param {string} featureName
	 */
	constructor(featureName) {
		super(`Unsupported feature "${featureName}"`);
	}
}
