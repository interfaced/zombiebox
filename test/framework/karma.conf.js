const path = require('path');

const zbPath = '../../zb';
const generatedPath = 'generated';
const testPath = 'suites';
const sinonPath = path.join(path.dirname(require.resolve('sinon/package.json')), 'pkg');

const [zbFiles, generatedFiles, testFiles] =
	[zbPath, generatedPath, testPath].map((root) => root + '/**/*.js');

module.exports = (config) => {
	config.set({
		autoWatch: false,
		singleRun: true,

		frameworks: ['mocha', 'chai'],
		reporters: ['mocha'],
		browsers: ['ChromeHeadlessNoSandbox'],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			}
		},
		files: [
			{type: 'module', pattern: zbFiles},
			{type: 'module', pattern: generatedFiles},
			{type: 'module', pattern: testFiles},
			{type: 'module', pattern: sinonPath + '/sinon-esm.js'}
		],

		preprocessors: {
			[zbFiles]: ['module-resolver'],
			[generatedFiles]: ['module-resolver'],
			[testFiles]: ['module-resolver']
		},

		moduleResolverPreprocessor: {
			aliases: {
				'zb': zbPath,
				'generated': generatedPath,
				'sinon': sinonPath
			},
			ecmaVersion: 2019
		}
	});
};
