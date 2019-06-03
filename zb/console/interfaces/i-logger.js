/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * @interface
 */
export default class ILogger {
	/**
	 * @param {...*} var_args
	 */
	log(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	debug(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	info(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	warn(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	error(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	assert(var_args) {}

	/**
	 * @param {...*} var_args
	 */
	dir(var_args) {}

	/**
	 * @param {string} label
	 */
	time(label) {}

	/**
	 * @param {string} label
	 */
	timeEnd(label) {}
}
