# ZombieBox project configuration

ZombieBox project uses several layers of configuration applied and merged together in this order:

* Default ZombieBox config, [lib/config/default.js](../lib/config/default.js)
* Configs for each Addon (Platform or Extension)
* Project config(s): either `config.js` under its root or any other files added with `--config` CLI option
* CLI overrides (`--config.field value`)

Each of the configs must adhere to config [schema](../lib/config/schema.json).

Config files are CommonJS modules that should provide a function. The function accepts config as it was accumulated so far and should return new config which will merged with previous configs.

All filesystem paths in configs should be either absolute or relative to project root (directory containing `package.json` file).

## Config options

See [config](config.md) for detailed description of config options

Mandatory options are `name`, `src` and `entry` under `project` field: 

```js
module.exports = () => ({
	project: {
		name: 'my-project',
		src: './src',
		entry: './src/application.js'
	}
})	
```

## Including files to artifact

For each type of file: script, module, css and static file there are several ways of including them into resulting HTML: Bundling them through compilation pipeline (GCC or PostCSS), inlining them into html (i.e. `<style>` tag for css) and including them as external resources (i.e. `<link>` tag for css).

ZombieBox treats external libraries and collections of files as Entities. Each Entity can have any number of each type of file. Entities are configured in `include` field: 

```js
module.exports = () => ({
	project: { /* ... */ },
	
	include: [
		{
			name: 'Bootstrap',
			externalCss: ['https://cdn/bootstrap.min.css'],
			css: ['libs/bootstrap/theme.css'],
			externalScripts: ['https://cdn/bootstrap.min.js'],
			externs: ['externs/bootstrap.js'],
			static: {
				'font.woff': 'static/fonts/Consolas.woff',
				'logo.png': 'static/32x32.png'
			}
		}
	]
})
```

It's important to remember:

* `modules` will go through same compilation process that application sources and should be properly typed
* Code interacting with `inlineScripts` and `externalScripts` will be minified with advanced optimisations (default) and for it to work correctly, you need to provide `externs` for your scripts. See [Advanced Compilation and Externs
](https://developers.google.com/closure/compiler/docs/api-tutorial3)


### Compilation, referencing and inlining

This is how various types of resources can be included into html artifact: 

| Resource type | inline (`inline*`) | Reference (`external*`) | Compilation (`*`) |
|---------------|--------------------|-------------------------|-------------------|
| script | `<script> FILE_CONTENTS </script>` | `<script src="LINK"></script>` | *Not possible* |
| module | *Not possible* | *Not possible* | Added to GCC source pool with `--js` flag |
| CSS | *Not possible* | `<link rel="stylesheet" href="LINK"></link>` | Added to PostCSS sources pool |

ZombieBox does not support module inlining and referencing as barely any of target platforms support modules.
Scripts compilation is not supported not to mix two concepts together.
