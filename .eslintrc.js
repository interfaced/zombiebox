const path = require('path');
const sinonPath = path.join(path.dirname(require.resolve('sinon/package.json')), 'pkg');

module.exports = {
	extends: 'interfaced',
	overrides: [
		{
			files: ['zb/**', 'test/framework/*/**', 'test/tools/addons/*/lib/**', 'templates/**/*.js'],
			extends: 'interfaced/esm',
			settings: {
				'import/resolver': {
					'zombiebox': {},
					'alias': {
						'map': [
							['sinon', sinonPath]
						]
					}
				}
			}
		},
		{
			files: ['zb/**'],
			plugins: [
				'header'
			],
			'rules': {
				'header/header': ['error', 'block', [
					'',
					' * This file is part of the ZombieBox package.',
					' *',
					{pattern: `\\* Copyright © 2012\\-${(new Date()).getFullYear()}, Interfaced`},
					' *',
					' * For the full copyright and license information, please view the LICENSE',
					' * file that was distributed with this source code.',
					' '
				]]
			}
		},
		{
			files: ['templates/**/*.js'],
			rules: {
				'import/no-unresolved': 'off',
				'no-useless-constructor': 'off'
			}
		},
		{
			files: ['test/framework/suites/**/*.js'],
			rules: {
				'import/no-unused-modules': 'off'
			}
		},
		{
			files: [
				'scripts/**',
				'bin/**',
				'lib/**',
				'.eslintrc.js',
				'test/tools/*.js',
				'test/tools/helpers/**',
				'test/tools/suites/**',
				'test/tools/addons/*/index.js',
				'test/framework/karma.conf.js'
			],
			extends: 'interfaced/node',
			rules: {
				'jsdoc/no-undefined-types': 'off', // Introduces circular dependencies
				'no-console': 'error' // Winston logger should be used for output
			}
		},
		{
			files: ['test/framework/suites/**', 'test/tools/suites/**'],
			extends: 'interfaced/mocha-chai'
		}
	]
};
