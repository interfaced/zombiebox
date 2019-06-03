const fs = require('fs');
const path = require('path');

// This file gets copied, symlinked and referenced in tests, its location can vary wildly and because of this
// we need this hack for find zombiebox. Actual addons should only do require('zombiebox').AbstractPlatform
let AbstractExtension;
try {
	AbstractExtension = require('zombiebox').AbstractExtension;
} catch (e) {
	AbstractExtension = require('../../../../lib/addons/abstract-extension')
}


/**
 */
class BlockchainExtension extends AbstractExtension {
	/**
	 * @override
	 */
	getName() {
		return 'blockchain';
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
	generateCode() {
		return {
			'private-key': fs.readFileSync(path.join(__dirname, 'private-key'), 'utf-8')
		};
	}
}


module.exports = BlockchainExtension;
