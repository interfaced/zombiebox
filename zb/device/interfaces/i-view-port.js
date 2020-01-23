/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {AspectRatio} from '../aspect-ratio/aspect-ratio';
import UnsupportedFeature from '../errors/unsupported-feature';
import Rect from '../../geometry/rect';


/**
 * @interface
 */
export default class IViewPort {
	/**
	 * @param {AspectRatio} ratio
	 * @throws {UnsupportedFeature}
	 */
	setAspectRatio(ratio) {}

	/**
	 * @return {?AspectRatio}
	 * @throws {UnsupportedFeature}
	 */
	getAspectRatio() {}

	/**
	 * Toggles aspect ratio from array
	 * @param {Array<AspectRatio>} bunch
	 * @throws {UnsupportedFeature}
	 */
	toggleAspectRatio(bunch) {}

	/**
	 * Sets display area
	 * @param {Rect} rect
	 * @throws {UnsupportedFeature}
	 */
	setArea(rect) {}

	/**
	 * Returns display area
	 * @return {?Rect}
	 * @throws {UnsupportedFeature}
	 */
	getArea() {}

	/**
	 * Returns display area in the current moment
	 * @return {Rect}
	 */
	getCurrentArea() {}

	/**
	 * Sets resolution to full screen
	 * @param {boolean} state
	 */
	setFullScreen(state) {}

	/**
	 * @deprecated Use isFullScreen
	 * Returns full screen state
	 * @return {boolean}
	 */
	getFullScreen() {}

	/**
	 * Returns full screen area
	 * @return {Rect}
	 */
	getFullScreenArea() {}

	/**
	 * Checks whether display resolution is full screen
	 * @return {boolean}
	 */
	isFullScreen() {}

	/**
	 * Updates viewport with current area
	 */
	updateViewPort() {}

	/**
	 * @param {AspectRatio} ratio
	 * @return {boolean} true if requested ratio supported
	 */
	isAspectRatioSupported(ratio) {}

	/**
	 * Checks support of getAspectRatio, setAspectRatio, toggleAspectRatio
	 * @return {boolean}
	 */
	hasAspectRatioFeature() {}

	/**
	 * Checks support of setArea, getArea
	 * @return {boolean}
	 */
	hasAreaChangeFeature() {}
}
