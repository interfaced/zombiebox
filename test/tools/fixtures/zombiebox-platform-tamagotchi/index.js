const path = require('path');

// This file gets copied, symlinked and referenced in tests, its location can vary wildly and because of this
// we need this hack for find zombiebox. Actual addons should only do require('zombiebox').AbstractPlatform
let AbstractPlatform;
try {
	AbstractPlatform = require('zombiebox').AbstractPlatform;
} catch (e) {
	AbstractPlatform = require('../../../../lib/addons/abstract-platform')
}


/**
 */
class TamagotchiPlatform extends AbstractPlatform {
	/**
	 * @override
	 */
	getName() {
		return 'tamagotchi';
	}

	/**
	 * @override
	 */
	getSourcesDir() {
		return path.join(__dirname, 'lib');
	}

	/**
	 * @override
	 */
	getConfig() {
		return {};
	}

	/**
	 * @override
	 */
	buildApp() {
		return Promise.resolve([]);
	}
}


module.exports = TamagotchiPlatform;
