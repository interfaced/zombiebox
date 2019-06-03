const zbPath = '../../zb';
const generatedPath = 'generated';
const testPath = 'suites';

const [zbFiles, generatedFiles, testFiles] =
	[zbPath, generatedPath, testPath].map((root) => root + '/**/*.js');

module.exports = (config) => {
	config.set({
		autoWatch: false,
		singleRun: true,

		frameworks: ['mocha', 'chai'],
		reporters: ['mocha'],
		browsers: ['ChromeHeadless'],

		files: [
			{type: 'module', pattern: zbFiles},
			{type: 'module', pattern: generatedFiles},
			{type: 'module', pattern: testFiles}
		],

		preprocessors: {
			[zbFiles]: ['module-resolver'],
			[generatedFiles]: ['module-resolver'],
			[testFiles]: ['module-resolver']
		},

		moduleResolverPreprocessor: {
			aliases: {
				'zb': zbPath,
				'generated': generatedPath
			}
		}
	});
};
