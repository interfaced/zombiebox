import AbstractDevice from 'zb/device/abstract-device';
import UnsupportedFeature from 'zb/device/errors/unsupported-feature';


/**
 */
export default class Device extends AbstractDevice {
	/**
	 * @override
	 */
	init() {
		this._fireEvent(this.EVENT_READY);
	}

	/**
	 * @override
	 */
	createVideo() {
		throw new UnsupportedFeature('Video creation');
	}

	/**
	 * @override
	 */
	exit() {
		throw new UnsupportedFeature('Exit');
	}

	/**
	 * @override
	 */
	getMAC() {
		throw new UnsupportedFeature('MAC address getting');
	}

	/**
	 * @override
	 */
	getIP() {
		throw new UnsupportedFeature('IP address getting');
	}

	/**
	 * @override
	 */
	setOSDOpacity() {
		throw new UnsupportedFeature('OSD opacity setting');
	}

	/**
	 * @override
	 */
	getOSDOpacity() {
		throw new UnsupportedFeature('OSD opacity getting');
	}

	/**
	 * @override
	 */
	setOSDChromaKey(chromaKey) {
		throw new UnsupportedFeature('OSD chroma key setting');
	}

	/**
	 * @override
	 */
	getOSDChromaKey() {
		throw new UnsupportedFeature('OSD chroma key getting');
	}

	/**
	 * @override
	 */
	removeOSDChromaKey() {
		throw new UnsupportedFeature('OSD chroma key removing');
	}

	/**
	 * @override
	 */
	getLaunchParams() {
		throw new UnsupportedFeature('Launch params getting');
	}

	/**
	 * @override
	 */
	getEnvironment() {
		throw new UnsupportedFeature('Environment getting');
	}

	/**
	 * @override
	 */
	hasOSDOpacityFeature() {
		return false;
	}

	/**
	 * @override
	 */
	hasOSDAlphaBlendingFeature() {
		return false;
	}

	/**
	 * @override
	 */
	hasOSDChromaKeyFeature() {
		return false;
	}

	/**
	 * @override
	 */
	isUHDSupported() {
		return false;
	}

	/**
	 * @return {boolean}
	 */
	static detect() {
		return true;
	}
}
