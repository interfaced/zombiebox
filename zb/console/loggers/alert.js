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
 */
export default class Alert extends BaseLogger {
	/**
	 * @override
	 */
	_send(level, args) {
		const strings = [];
		for (let i = 0; i < args.length; i++) {
			strings.push(String(args[i]));
		}

		const logStr = `Level: ${level} ${strings.join(' ')}`;
		window.alert(logStr); // eslint-disable-line no-alert
	}
}
