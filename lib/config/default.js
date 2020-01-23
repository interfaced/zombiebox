/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const path = require('path');

/**
 * @return {Object}
 */
module.exports = () => ({
	project: {
		// name: undefined,
		// entry: undefined,
		// src: undefined,
		dist: 'dist/'
	},

	gcc: {},

	postcss: {
		// importEntryPoints: undefined,
		presetEnv: {
			browsers: 'last 100 versions',
			stage: 3,
			features: {}
		},
		filePlugins: [],
		bundlePlugins: [],
		url: {
			url: 'copy',
			assetsPath: 'styles',
			useHash: true
		},
		csso: {}
	},

	include: [
		{
			name: 'ZombieBox polyfills',
			inlineScripts: [
				path.join(__dirname, '..', '..', 'vendor', 'a.js'),
				path.join(__dirname, '..', '..', 'vendor', 'raf.js')
			]
		}
	],

	extensions: {},

	platforms: {},

	aliases: {},

	define: {
		ENABLE_CONSOLE: true,
		PLATFORM_NAME: ''
	},

	devServer: {
		port: 1337,
		proxy: {},
		enableRawProxy: false
		// backdoor: undefined
	},

	skipVersionsCheck: false,

	generatedCode: '.generated/',

	templates: []
});
