const mockRequire = require('mock-require');
const {spy} = require('sinon');

const gccSpy = spy();


/**
 */
class ClosureCompilerStub {
	/**
	 * @param {...?} args
	 */
	constructor(...args) {
		gccSpy(...args);
	}

	/**
	 * @param {Function} callback
	 */
	run(callback) {
		callback(0, '', '');
	}
}


const mock = () => mockRequire('google-closure-compiler', {compiler: ClosureCompilerStub});

const stop = () => mockRequire.stop('google-closure-compiler');

// Should be ran ASAP to prevent other modules from requiring the real compiler and caching it
mock();

module.exports = {
	mock,
	stop,
	spy: gccSpy
};
