import Device from './device';


/**
 * @return {?Device}
 */
export default function create() {
	if (Device.detect()) {
		return new Device();
	}

	return null;
}
