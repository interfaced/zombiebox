/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @interface
 */
export default class ILogger {
	/**
	 * @param {...*} args
	 */
	log(args) {}

	/**
	 * @param {...*} args
	 */
	debug(args) {}

	/**
	 * @param {...*} args
	 */
	info(args) {}

	/**
	 * @param {...*} args
	 */
	warn(args) {}

	/**
	 * @param {...*} args
	 */
	error(args) {}

	/**
	 * @param {...*} args
	 */
	assert(args) {}

	/**
	 * @param {...*} args
	 */
	dir(args) {}

	/**
	 * @param {string} label
	 */
	time(label) {}

	/**
	 * @param {string} label
	 */
	timeEnd(label) {}
}
