/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import AbstractModel from './abstract-model';


/**
 * @template INPUT_TYPE
 * @abstract
 */
export default class AbstractModelApi extends AbstractModel {
	/**
	 * @param {INPUT_TYPE=} data
	 */
	constructor(data) {
		super();

		if (data) {
			this.parse(data);
		}
	}

	/**
	 * @abstract
	 * @param {INPUT_TYPE} data
	 */
	parse(data) {}
}
