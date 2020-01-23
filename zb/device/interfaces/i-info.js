/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {Resolution} from '../resolutions';
import UnsupportedFeature from '../errors/unsupported-feature';


/**
 * @interface
 */
export default class IInfo {
	/**
	 * Returns device type (e.g. 'pc', 'dune', 'samsung' etc.)
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	type() {}

	/**
	 * Returns device OS version
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	version() {}

	/**
	 * Returns device manufacturer/vendor
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	manufacturer() {}

	/**
	 * Returns device model string
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	model() {}

	/**
	 * Returns device serial number
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	serialNumber() {}

	/**
	 * Returns device software version
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	softwareVersion() {}

	/**
	 * Returns device hardware version
	 * @return {string}
	 * @throws {UnsupportedFeature}
	 */
	hardwareVersion() {}

	/**
	 * @deprecated Use getOSDResolution instead
	 * @return {Resolution}
	 * @throws {UnsupportedFeature}
	 */
	osdResolutionType() {}

	/**
	 * Returns physical screen panel resolution, typically largest possible resolution for video
	 * @return {!Resolution}
	 * @throws {UnsupportedFeature}
	 */
	getPanelResolution() {}

	/**
	 * Returns html viewport resolution
	 * @return {!Resolution}
	 * @throws {UnsupportedFeature}
	 */
	getOSDResolution() {}

	/**
	 * Returns current locale valid for BCP47 format or null
	 * @return {?string}
	 * @throws {UnsupportedFeature}
	 */
	locale() {}
}
