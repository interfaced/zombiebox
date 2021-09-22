/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import Layer from './layer';


/**
 */
export default class Scene extends Layer {
	/**
	 */
	constructor() {
		super();

		this._addContainerClass('_scene');
	}
}
