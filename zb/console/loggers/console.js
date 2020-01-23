/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import ILogger from '../interfaces/i-logger';


/**
 * @implements {ILogger}
 */
export default class Console {
	/**
	 */
	constructor() {
		const console = window['console'] || null;
		if (console) {
			this.info = console['info'].bind(console);
			this.dir = console['dir'].bind(console);
			this.log = console['log'].bind(console);
			this.debug = console['debug'].bind(console);
			this.assert = console['assert'].bind(console);
			this.error = console['error'].bind(console);
			this.warn = console['warn'].bind(console);
			this.time = console['time'].bind(console);
			this.timeEnd = console['timeEnd'].bind(console);
		}
	}

	/**
	 * @override
	 */
	info() {/* Override in constructor */}

	/**
	 * @override
	 */
	dir() {/* Override in constructor */}

	/**
	 * @override
	 */
	log() {/* Override in constructor */}

	/**
	 * @override
	 */
	debug() {/* Override in constructor */}

	/**
	 * @override
	 */
	assert() {/* Override in constructor */}

	/**
	 * @override
	 */
	error() {/* Override in constructor */}

	/**
	 * @override
	 */
	warn() {/* Override in constructor */}

	/**
	 * @override
	 */
	time() {/* Override in constructor */}

	/**
	 * @override
	 */
	timeEnd() {/* Override in constructor */}
}
