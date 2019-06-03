/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {ENABLE_CONSOLE} from 'generated/define';
import ILogger from './interfaces/i-logger';


/**
 * Levels mask,
 * @param {number} levels
 */
export const setLevel = (levels) => {
	if (!ENABLE_CONSOLE) {
		return;
	}

	_levels = levels;
};


/**
 * @param {Level} level
 */
export const enableLevel = (level) => {
	if (!ENABLE_CONSOLE) {
		return;
	}

	setLevel(_levels | level);
};


/**
 * @param {Level} level
 */
export const disableLevel = (level) => {
	if (!ENABLE_CONSOLE) {
		return;
	}

	setLevel(_levels ^ level);
};


/**
 * @param {ILogger} logger
 */
export const setLogger = (logger) => {
	if (!ENABLE_CONSOLE) {
		return;
	}

	_logger = logger;
	setLevel(_levels);
};


/**
 * @return {ILogger}
 */
export const getLogger = () => _logger;


/**
 * @param {...*} var_args
 */
export const log = (...var_args) => {
	if (_shouldPrint(Level.LOG)) {
		_logger.log(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const debug = (...var_args) => {
	if (_shouldPrint(Level.DEBUG)) {
		_logger.debug(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const info = (...var_args) => {
	if (_shouldPrint(Level.INFO)) {
		_logger.info(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const warn = (...var_args) => {
	if (_shouldPrint(Level.WARN)) {
		_logger.warn(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const error = (...var_args) => {
	if (_shouldPrint(Level.ERROR)) {
		_logger.error(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const assert = (...var_args) => {
	if (_shouldPrint(Level.ASSERT)) {
		_logger.assert(...var_args);
	}
};


/**
 * @param {...*} var_args
 */
export const dir = (...var_args) => {
	if (_shouldPrint(Level.DIR)) {
		_logger.dir(...var_args);
	}
};


/**
 * @param {string} label
 */
export const time = (label) => {
	if (_shouldPrint(Level.TIME)) {
		_logger.time(label);
	}
};


/**
 * @param {string} label
 */
export const timeEnd = (label) => {
	if (_shouldPrint(Level.TIME)) {
		_logger.timeEnd(label);
	}
};


/**
 * @param {number} level
 * @return {boolean}
 * @private
 */
const _shouldPrint = (level) => Boolean(
	ENABLE_CONSOLE &&
	_logger &&
	_levels & level
);


/**
 * @type {?ILogger}
 * @private
 */
let _logger = null;


/**
 * @enum {number}
 */
export const Level = {
	ALL: 255,
	LOG: 1,
	DEBUG: 2,
	INFO: 4,
	WARN: 8,
	ERROR: 16,
	ASSERT: 32,
	DIR: 64,
	TIME: 128
};


/**
 * @type {number}
 * @private
 */
let _levels = Level.ALL;
