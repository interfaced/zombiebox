/*
 * This file is part of the ZombieBox package.
 *
 * Copyright (c) 2012-2019, Interfaced
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
	 * @param {INPUT_TYPE=} opt_data
	 */
	constructor(opt_data) {
		super();

		if (opt_data) {
			this.parse(opt_data);
		}
	}

	/**
	 * @abstract
	 * @param {INPUT_TYPE} data
	 */
	parse(data) {}
}
