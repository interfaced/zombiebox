/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
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
 * @param {...*} args
 */
export const log = (...args) => {
	if (_shouldPrint(Level.LOG)) {
		_logger.log(...args);
	}
};


/**
 * @param {...*} args
 */
export const debug = (...args) => {
	if (_shouldPrint(Level.DEBUG)) {
		_logger.debug(...args);
	}
};


/**
 * @param {...*} args
 */
export const info = (...args) => {
	if (_shouldPrint(Level.INFO)) {
		_logger.info(...args);
	}
};


/**
 * @param {...*} args
 */
export const warn = (...args) => {
	if (_shouldPrint(Level.WARN)) {
		_logger.warn(...args);
	}
};


/**
 * @param {...*} args
 */
export const error = (...args) => {
	if (_shouldPrint(Level.ERROR)) {
		_logger.error(...args);
	}
};


/**
 * @param {...*} args
 */
export const assert = (...args) => {
	if (_shouldPrint(Level.ASSERT)) {
		_logger.assert(...args);
	}
};


/**
 * @param {...*} args
 */
export const dir = (...args) => {
	if (_shouldPrint(Level.DIR)) {
		_logger.dir(...args);
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
