/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import ILogger from '../interfaces/i-logger';
import {Level} from '../console';


/**
 * @implements {ILogger}
 */
export default class BaseLogger {
	/**
	 */
	constructor() {
		/**
		 * @type {function(Level, Array<*>)}
		 * @protected
		 */
		this._send;

		/**
		 * @type {Object}
		 * @protected
		 */
		this._timers = {};
	}

	/**
	 * @override
	 */
	log(...var_args) {
		this._log(Level.LOG, var_args);
	}

	/**
	 * @override
	 */
	debug(...var_args) {
		this._log(Level.DEBUG, var_args);
	}

	/**
	 * @override
	 */
	info(...var_args) {
		this._log(Level.INFO, var_args);
	}

	/**
	 * @override
	 */
	warn(...var_args) {
		this._log(Level.WARN, var_args);
	}

	/**
	 * @override
	 */
	error(...var_args) {
		this._log(Level.ERROR, var_args);
	}

	/**
	 * @override
	 */
	assert(...var_args) {
		this._log(Level.ASSERT, var_args);
	}

	/**
	 * @override
	 */
	dir(...var_args) {
		this._log(Level.DIR, var_args);
	}

	/**
	 * @override
	 */
	time(label) {
		if (label) {
			this._timers[label] = Date.now();
		}
	}

	/**
	 * @override
	 */
	timeEnd(label) {
		const timers = this._timers;
		if (timers[label]) {
			this._log(Level.TIME, [`${label}: ${Date.now() - timers[label]}ms`]);
			delete timers[label];
		}
	}

	/**
	 *
	 * @param {Level} level
	 * @param {Arguments|Array} args
	 * @protected
	 */
	_log(level, args) {
		if (!this._send) {
			return;
		}
		this._send(level, Array.prototype.slice.call(args, 0));
	}

	/**
	 * @param {Level} level
	 * @return {string}
	 */
	static level2string(level) {
		switch (level) {
			case Level.LOG: return 'LOG';
			case Level.DEBUG: return 'DEBUG';
			case Level.INFO: return 'INFO';
			case Level.WARN: return 'WARN';
			case Level.ERROR: return 'ERROR';
			case Level.ASSERT: return 'ASSERT';
			case Level.DIR: return 'DIR';
			case Level.TIME: return 'TIME';
			default:
				return 'ALL';
		}
	}
}
