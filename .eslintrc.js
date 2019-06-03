const {join, dirname} = require('path');

function resolveModulePath(packageName) {
	const packageInfoPath = require.resolve(`${packageName}/package.json`);
	return join(dirname(packageInfoPath), require(packageInfoPath).module);
}

module.exports = {
	extends: 'interfaced',
	overrides: [
		{
			files: ['zb/**', 'test/framework/*/**', 'test/tools/addons/*/lib/**'],
			settings: {
				'import/resolver': {
					alias: [
						['zb', join(__dirname, 'zb')],
					]
				}
			},
			...require('eslint-config-interfaced/overrides/esm')
		},
		{
			files: [
				'scripts/**',
				'bin/**',
				'lib/**',
				'test/tools/*.js',
				'test/tools/helpers/**',
				'test/tools/suites/**',
				'test/tools/addons/*/index.js',
				'test/framework/karma.conf.js'
			],
			...require('eslint-config-interfaced/overrides/node')
		},
		{
			files: [
				'scripts/**',
				'bin/**',
				'lib/**',
				'test/tools/*.js',
				'test/tools/helpers/**',
				'test/tools/suites/**',
				'test/tools/addons/*/index.js',
				'test/framework/karma.conf.js'
			],
			rules: {
				'node/no-unsupported-features/es-builtins': ["error", { "version": ">=8.9" }],
				'node/no-unsupported-features/es-syntax': ["error", { "version": ">=8.9" }],
				'node/no-unsupported-features/node-builtins': ["error", { "version": ">=8.9" }],
				'node/no-deprecated-api': ['error', {
					'ignoreModuleItems': [
						'url.parse' // TODO: remove once node 8 support is dropped and the deprecation is handled
					]
				}]
			}
		},
		{
			files: ['zb/**', 'test/framework/**', 'test/tools/addons/*/lib/**'],
			rules: {
				'import/no-unresolved': ['error', {ignore: ['^generated/']}]
			},
		},
		{
			files: ['test/framework/suites/**', 'test/tools/suites/**'],
			...require('eslint-config-interfaced/overrides/mocha-chai')
		}
	]
};
