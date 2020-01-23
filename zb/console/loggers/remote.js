/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import BaseLogger from './base-logger';


/**
 * Developer mode(launch developer server by `zb run` and launch application from this server):
 *     Logs are send automatically to http://developer-server-name:1337/log, there is no need to specify url
 * Compiled application:
 *     1. You have to run log server from npm package 'zb-log-server' and specify port and path.
 *     E.g. `zb-log-server --port 8181 --path /logPath`
 *     2. Specify full URL to your log-server in compiled application in url argument.
 *     E.g. 'http://192.168.1.3:8181/logPath'
 */
export default class Remote extends BaseLogger {
	/**
	 * @param {Options=} options
	 */
	constructor(options = {}) {
		super();

		/**
		 * @type {StrictOptions}
		 * @protected
		 */
		this._options = this._parseOptions(options);

		/**
		 * @type {Array<string>}
		 * @protected
		 */
		this._buffer = [];

		this._shiftBuffer = this._shiftBuffer.bind(this);
	}

	/**
	 * Clear send queue
	 */
	clearBuffer() {
		this._buffer.splice(0, this._buffer.length);
	}

	/**
	 * @override
	 */
	_send(level, args) {
		const strings = [];
		for (let i = 0; i < args.length; i++) {
			strings.push(String(args[i]));
		}

		const logStr = `[${BaseLogger.level2string(level)}] ${Date.now()} ${strings.join(' ')}`;

		if (this._options.delayed) {
			this._buffer.push(logStr);
			if (this._buffer.length === 1) {
				setTimeout(this._shiftBuffer, this._options.sendDelay);
			}
		} else {
			this._sendString(logStr);
		}
	}

	/**
	 * @param {Options=} options
	 * @return {StrictOptions}
	 * @protected
	 */
	_parseOptions(options = {}) {
		const getValue = (value, defaultValue) => {
			if (typeof options.url === 'undefined') {
				return defaultValue;
			}

			return value;
		};

		options.url = getValue(options.url, '/log');
		options.async = getValue(options.async, true);
		options.delayed = getValue(options.delayed, false);
		options.sendDelay = getValue(options.sendDelay, 50);

		return /** @type {StrictOptions} */ (options);
	}

	/**
	 * Send first item from buffer
	 * @protected
	 */
	_shiftBuffer() {
		if (!this._buffer.length) {
			return;
		}

		this._sendString(this._buffer.shift());
		if (this._buffer.length) {
			setTimeout(this._shiftBuffer, this._options.sendDelay);
		}
	}

	/**
	 * @param {string} str
	 * @protected
	 */
	_sendString(str) {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', this._options.url, this._options.async);
		xhr.send(str);
	}
}


/**
 * @typedef {{
 *     url: string,
 *     async: boolean,
 *     delayed: boolean,
 *     sendDelay: number
 * }}
 */
export let StrictOptions;


/**
 * @typedef {{
 *     url: (string|undefined),
 *     async: (boolean|undefined),
 *     delayed: (boolean|undefined),
 *     sendDelay: (number|undefined)
 * }}
 */
export let Options;
