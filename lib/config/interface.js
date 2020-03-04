/*
This file was generated automatically from config/schema.js.
Do not edit it manually!
*/


/**
 * ZombieBox project configuration schema
 * @interface
 **/
class IZombieBoxConfig {
	/** */
	constructor() {
		/**
		 *
		 * @type {IProjectConfig}
		 */
		this.project;

		/**
		 * [Closure Compiler flags](https://github.com/google/closure-compiler/wiki/Flags-and-Options).
		 * Some flags (`--js`, `--externs` et al.) are set internally by ZombieBox,
		 * overriding them might break everything.
		 * @type {Object}
		 */
		this.gcc;

		/**
		 *
		 * @type {IPostCSSConfig}
		 */
		this.postcss;

		/**
		 * Resources, source and other files for additional entities (libraries, extra scripts and static files)
		 * @type {Array<IEntityConfig>}
		 */
		this.include;

		/**
		 * ZombieBox extensions specific configuration options
		 * @type {Object}
		 */
		this.extensions;

		/**
		 * ZombieBox platforms specific configuration options
		 * @type {Object}
		 */
		this.platforms;

		/**
		 * A map of any additional aliases
		 * @type {Object<string>}
		 */
		this.aliases;

		/**
		 * Compilation time defines that will be added as runtime constants
		 * @type {Object}
		 */
		this.define;

		/**
		 *
		 * @type {IDevServerConfig}
		 */
		this.devServer;

		/**
		 * Skip ZombieBox components peerDependencies compatibility check, false by default
		 * @type {boolean}
		 */
		this.skipVersionsCheck;

		/**
		 * Absolute path to directory that will contain code generated in runtime
		 * @type {string}
		 */
		this.generatedCode;

		/**
		 * Directories to search for server-side templates for (used in scaffolding)
		 * @type {Array<string>}
		 */
		this.templates;
	}
}


/**
 * Vital project configuration
 * @interface
 **/
class IProjectConfig {
	/** */
	constructor() {
		/**
		 * Project name; Will be used as alias name for all project sources
		 * @type {string}
		 */
		this.name;

		/**
		 * Absolute path to application entry point class file path; Must provide a default export
		 * @type {string}
		 */
		this.entry;

		/**
		 * Absolute path to directory with application sources; Will be aliased as project name
		 * @type {string}
		 */
		this.src;

		/**
		 * Absolute path to output directory; Build artifacts will be put here
		 * @type {string}
		 */
		this.dist;
	}
}


/**
 * Additional resources
 * @interface
 **/
class IEntityConfig {
	/** */
	constructor() {
		/**
		 * Entity name; Not used for any purposes whatsoever
		 * @type {string}
		 */
		this.name;

		/**
		 * File paths to CSS files to be bundled via PostCSS
		 * @type {Array<string>}
		 */
		this.css;

		/**
		 * URIs of CSS files to be included as link references
		 * @type {Array<string>}
		 */
		this.externalCss;

		/**
		 * File paths to JS module files to be compiled
		 * @type {Array<string>}
		 */
		this.modules;

		/**
		 * File paths to JS scripts to be inlined into html via `<script>` tags
		 * @type {Array<string>}
		 */
		this.inlineScripts;

		/**
		 * URIs of JS scripts to be included as link references
		 * @type {Array<string>}
		 */
		this.externalScripts;

		/**
		 * File paths to GCC externs
		 * @type {Array<string>}
		 */
		this.externs;

		/**
		 * Map of extra static files to be included into build; Key: web path, value: file system path
		 * @type {Object<string>}
		 */
		this.static;

		/**
		 * Map of modules aliases; Key: alias name, value: File system path to its root
		 * @type {Object<string>}
		 */
		this.aliases;
	}
}


/**
 * Configures CSS files processing and bundling
 * @interface
 **/
class IPostCSSConfig {
	/** */
	constructor() {
		/**
		 * CSS @import entry point, if not set imports will not be processed
		 * @type {Array<string>}
		 */
		this.importEntryPoints;

		/**
		 * [postcss-preset-env options](https://github.com/csstools/postcss-preset-env#options)
		 * @type {Object}
		 */
		this.presetEnv;

		/**
		 * Any additional plugin instances that will be run against each file. Also run by dev server.
		 * @type {Array}
		 */
		this.filePlugins;

		/**
		 * Any additional plugin instances that will be run against resulting CSS bundle. Not run by dev server
		 * @type {Array}
		 */
		this.bundlePlugins;

		/**
		 * [postcss-url options](https://github.com/postcss/postcss-url#options-combinations)
		 * @type {Object}
		 */
		this.url;

		/**
		 * [CSSO optimizer options](https://github.com/css/csso#compressast-options)
		 * @type {Object}
		 */
		this.csso;
	}
}


/**
 * Development server options
 * @interface
 **/
class IDevServerConfig {
	/** */
	constructor() {
		/**
		 * HTTP port
		 * @type {number}
		 */
		this.port;

		/**
		 * Map of urls to proxy
		 * @type {Object<string>}
		 */
		this.proxy;

		/**
		 * Enables proxy at `/proxy?url=`
		 * @type {boolean}
		 */
		this.enableRawProxy;

		/**
		 * Path to a JS module file that will be include in dev server only
		 * @type {string}
		 */
		this.backdoor;
	}
}


module.exports = {
	IZombieBoxConfig: IZombieBoxConfig,
	IProjectConfig: IProjectConfig,
	IEntityConfig: IEntityConfig,
	IPostCSSConfig: IPostCSSConfig,
	IDevServerConfig: IDevServerConfig
};
