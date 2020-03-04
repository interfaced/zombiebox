<!--
This file was generated automatically from config/schema.js.
Do not edit it manually!
-->

# ZombieBoxConfig

ZombieBox project configuration schema

| Key | Type | Description | 
| --- | --- | --- |
| project | [`ProjectConfig`](#markdown-header-projectconfig) | **Required!** Vital project configuration |
| gcc | Object | [Closure Compiler flags](https://github.com/google/closure-compiler/wiki/Flags-and-Options). Some flags (`--js`, `--externs` et al.) are set internally by ZombieBox, overriding them might break everything. |
| postcss | [`PostCSSConfig`](#markdown-header-postcssconfig) | Configures CSS files processing and bundling |
| include | Array<[`EntityConfig`](#markdown-header-entityconfig)> | Resources, source and other files for additional entities (libraries, extra scripts and static files) |
| extensions | Object | ZombieBox extensions specific configuration options |
| platforms | Object | ZombieBox platforms specific configuration options |
| aliases | Object<string> | A map of any additional aliases |
| define | Object | Compilation time defines that will be added as runtime constants |
| devServer | [`DevServerConfig`](#markdown-header-devserverconfig) | Development server options |
| skipVersionsCheck | boolean | Skip ZombieBox components peerDependencies compatibility check, false by default |
| generatedCode | string | Absolute path to directory that will contain code generated in runtime |
| templates | Array<string> | Directories to search for server-side templates for (used in scaffolding) |

## ProjectConfig

Vital project configuration

| Key | Type | Description | 
| --- | --- | --- |
| name | string | **Required!** Project name; Will be used as alias name for all project sources |
| entry | string | **Required!** Absolute path to application entry point class file path; Must provide a default export |
| src | string | **Required!** Absolute path to directory with application sources; Will be aliased as project name |
| dist | string | Absolute path to output directory; Build artifacts will be put here |


## EntityConfig

Additional resources

| Key | Type | Description | 
| --- | --- | --- |
| name | string | Entity name; Not used for any purposes whatsoever |
| css | Array<string> | File paths to CSS files to be bundled via PostCSS |
| externalCss | Array<string> | URIs of CSS files to be included as link references |
| modules | Array<string> | File paths to JS module files to be compiled |
| inlineScripts | Array<string> | File paths to JS scripts to be inlined into html via `<script>` tags |
| externalScripts | Array<string> | URIs of JS scripts to be included as link references |
| externs | Array<string> | File paths to GCC externs |
| static | Object<string> | Map of extra static files to be included into build; Key: web path, value: file system path |
| aliases | Object<string> | Map of modules aliases; Key: alias name, value: File system path to its root |


## PostCSSConfig

Configures CSS files processing and bundling

| Key | Type | Description | 
| --- | --- | --- |
| importEntryPoints | Array<string> | CSS @import entry point, if not set imports will not be processed |
| presetEnv | Object | [postcss-preset-env options](https://github.com/csstools/postcss-preset-env#options) |
| filePlugins | Array | Any additional plugin instances that will be run against each file. Also run by dev server. |
| bundlePlugins | Array | Any additional plugin instances that will be run against resulting CSS bundle. Not run by dev server |
| url | Object | [postcss-url options](https://github.com/postcss/postcss-url#options-combinations) |
| csso | Object | [CSSO optimizer options](https://github.com/css/csso#compressast-options) |


## DevServerConfig

Development server options

| Key | Type | Description | 
| --- | --- | --- |
| port | number | HTTP port |
| proxy | Object<string> | Map of urls to proxy |
| enableRawProxy | boolean | Enables proxy at `/proxy?url=` |
| backdoor | string | Path to a JS module file that will be include in dev server only |


