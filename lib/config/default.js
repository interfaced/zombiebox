/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2021, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import {resolve} from '../utils.js';

/**
 * @return {Object}
 */
export default () => ({
	project: {
		// name: undefined,
		// entry: undefined,
		// src: undefined,
		dist: 'dist/'
	},

	build: {
		inlineJS: false,
		inlineCSS: false
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
				resolve(import.meta.url, '../../vendor/a.js'),
				resolve(import.meta.url, '../../vendor/raf.js')
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
