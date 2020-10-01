# Change log

## 2.7.4 (release date: 01.10.2020)
Virtually the same as `2.7.4-alpha.1`

### Framework
* Fix start position not being applied on webOS in some cases

### Tools
* Closure compiler updated to `20200927`

## 2.7.4-alpha.1 (release date: 30.09.2020)

### Framework
* Experimental fix for an issue on webOS 2017 when start position fails to apply in some cases.

## 2.7.3 (release date: 05.08.2020)

### Framework
* Added export if `NativeReadyState` to `StatefulHtml5Video`

### Tools
* Replaced `chalk` with `kleur`
* Improved output of `--help` option for CLI tools

## 2.7.2 (release date: 22.04.2020)

### Framework
* Fixed `EVENT_INNER_FOCUS` being left out from `IWidget` interface

## 2.7.1 (release date: 20.04.2020)

### Framework
* Added `EVENT_INNER_FOCUS` to `Container` this event is fired when focus moves within a container (scene or widget) and propagates all the way to root `Container`

### Tools
* Boilerplate application expanded to show case more real cases like video player, navigation and scene opening
* Closure compiler updated to `20200224`
 
## 2.7.0 (release date: 04.03.2020) 

### Framework
* `StatefulHtml5Video` now ensures `START_POSITION` is applied before entering `READY`
* `IStatefulVideo.getEngine` method was added that exposes internal platform-specific engine
* Disabled widgets no longer receive mouse clicks
* Fix duplication of mouse listeners on widgets that get changed from one parent to another in some cases

### Tools
* Fixed several compatibility issues on Windows 
* Added a warning against node versions not compatible with versions specified in `engines` fields of application and its dependencies.  
* Parallelized and optimised some filesystem operations
* Several deprecated APIs were removed, see previous versions for migration guides
* Google Closure Compiler udpated to `20200224`

## 2.6.1 (release date: 03.02.2020)

### Tools
* Fix parsing of some GCC output

## 2.6.0 (release date: 03.02.2020)

### Tools
* Build process was refactored, CLI commands and Platform API were affected. See [migrations/2.5.0.md](./docs/migrations/2.5.0.md) for more details.
  * `zb build` now only accepts one platform and can't build for several at once.
  * `AbstractPlatform.buildApp` method is deprecated in favor of `AbstractPlatform.pack`.
  * Include entities now only get included in build for the platform that specified them. 
* Console output and logging was improved and now can be controlled with `--log-level` or `-l` flag, see `zb --help`. 
* `generated/package-info` was removed.

## 2.5.0 (release date 23.01.2020)

### Framework
* ENTER key events caused by mouse clicks now no longer propagates down widget tree.
* `generated/package-info` was deprecated and several defines were introduced to replace it. See [migrations/2.5.0.md](./docs/migrations/2.5.0.md) for more details.
* Version checker will now tolerate prerelease versions.

### Tools
* Google Closure Compiler updated to 20200101.0.0
* ECMAScript version increased to 2019
* Node 8 support dropped as it left LTS

## 2.4.0 (release date 28.12.2019)

Identical to `2.0.0-rc.2`, changes since previous stable version (`2.3.0`) are listed.

This release introduces `IStatefulVideo` and tis Abstract and HTML5 implementations. Stateful Video has a much stricter model that leverages more stability, standardisation and error handling. Additionally it supports DRM playback.
Stateful Video is meant to replace current IVideo, but at this point both are available and the latte is not even deprecated.
Migrating to Stateful Video will require a large effort as its model and APIs are vastly incompatible with previous IVideo.

For more details on Stateful Video see [docs/video](./docs/video/).

Other changes:

* `PrincipalAxisNavigation` is now used as first spatial navigation strategy of choice
* `EventPublisher` refactored, added `runAfterCurrentEvent` method, improved test coverage
* QHD resolution support removed, 4K and 8K added
* `Info.osdResolutionType` deprecated in favor of `getOSDResolution` and `getPanelResolution`
* `Viewport.getFullScreen` deprecated in favor of `isFullScreen`
* `AbstractStatefulVideo` and `AbstracViewport` constructors both now accept panel and app resolutions
* `zb/http` `decodeParams` now returns properly empty object if query string is empty as opposed to object with empty keys

## 2.4.0-rc.2 (release date 28.12.2019)

### Framework
* Ensure no changes in html5 engine or Video happen once Video entered `ERROR` state
* `EVENT_ERROR` now tries to make a better message 

### Tools
* Fixed issue when errors occurred while loading custom configs could be consumed and not reported 

## 2.4.0-rc.1 (release date 27.12.2019)

### Framework
* Aborting transition in `StateMachine` now restores it to previous state

### Tools
* ESLint, its configs and plugins updated
* Fix polyfills not being included in build
* Workaround for GCC issue that prevents object destructuring from working without native `Object.assign` 

## 2.4.0-alpha.6 (release date 19.12.2019)

### Framework
* `PrincipalAxisNavigation` is now used as first spatial navigation strategy of choice
* Improved stability of `StatefulVideo`, especially when destroying it
* `EVENT_STATE_EXIT` now happens before asynchronous transitions. This makes `getState` return `null` in between states. `getPendingTransitions` should be used in this occasions.
* `EventPublisher` refactored, added `runAfterCurrentEvent` method, improved test coverage

## 2.4.0-alpha.5 (release date 16.12.2019)
### Framework
* Ensure `getUrl` always returns url in LOADING state
* Refactor Viewport to always accept application coordinates
* `Device.createStatefulVideo` no longer requires Rect parameter
* QHD resolution removed support, 4K and 8K added
* `AbstractStatefulVideo` and `AbstracViewport` constructors both now accept panel and app resolutions
* `Info.osdResolutionType` deprecated in favor of `getOSDResolution` and `getPanelResolution`
* `Viewport.getFullScreen` deprecated in favor of `isFullScreen`

## 2.4.0-alpha.4 (release date 12.12.2019)
### Framework
* Added `PrepareOption` to support 4K and 8K video.
* Added `Device.isUHD8KSupported`.
* Fixed StatefulVideo positioning in letterbox mode. 

## 2.4.0-alpha.3 (release date 05.12.2019)

### Framework
* VerimatrixClient added, support VCAS.

## 2.4.0-alpha.2 (release date 02.12.2019)

### Framework
* DRM support was added. See [drm.md](./docs/video/drm.md) for more details. 
* new `IStatefulVideo` methods: static `isDRMSupported`, static `canHandleMultiDRM`, `attachDRM`, `detachDRM`.
* new interfaces and classes: `IDRMClient`, `AbstractDRMClient`, `PlayReadyClient`.
* `PrepareOption.FORMAT` was renamed to `PrepareOption.TYPE` and now accepts mime-type. `MediaType` enum added with common mime types.

## 2.4.0-alpha.1 (release date 19.11.2019)

Unstable channel release.

### Framework
* `IStatefulVideo`, `AbstractStatefulVideo` and `StatefulHtml5Video` classes and `Device.createStatefulVideo` were added. This a new video interface expected to eventually replace `IVideo`, in foreseeable future however they will coexist. It's much more strict and standardized. See [](./docs/video)
* `zb/http` `decodeParams` now returns properly empty object if query string is empty as opposed to object with empty keys.

## 2.3.0 (release date 02.10.2019)

### Tools
* Build tasks no longer watch file system changes. This helps to avoid Chokidar issues [#873](https://github.com/paulmillr/chokidar/issues/873) and [#859](https://github.com/paulmillr/chokidar/issues/859) and generally improves their performance.
* `SourceProviderCodeCache` was renamed to `SourceProviderGenerated`.
* `Application.ready` now also builds generated code (no longer necessary to call `buildCode`).
* Added `watch` and `stopWatching` methods to `ISourceProvider`. 
* Google Closure Compiler updated to 20190929.0.0

### Framework
* Widget theme functionality (`setTheme`) was removed.
* `input/keys.js` renamed to `input/key.js`. Old name is kept as alias. Will be deprecated and replaced soon.
* Fixed GCC warnings in StateMachine.

## 2.2.3 (release date: 24.09.2019)

### Tools
* `postcss.extraPlugins` property was split into two: `filePlugins` and `bundlePlugins` to allow more granular control over when plugins are run. `filePlugins` is similar to `extraPlugins` behaviour prior to version 2.2.0.

## 2.2.2 (release date: 20.09.2019)

### Framework
* Avoid using `ParentNode.prepend` because of some unidentified problems with its polyfill.

## 2.2.1 (release date: 18.09.2019)

### Framework
* Fixed mouse clicks sometimes not being processed on widgets with child widgets.
* Removed unnecessary mouse activation/deactivation events when mouse moves within application body from one element to another. 

### Tools
* Google Closure Compiler updated to 20190909

## 2.2.0 (release date: 27.08.2019)

### Tools
Several changes in CSS processing, some of them might be breaking (see [Migration doc](./docs/migrations/2.2.0.md)):

* New config option `postcss.importEntryPoints`. Setting it will change the behavior of css files processing: Instead of bundling all css files, ZombieBox will look into files set as entry points and will only bundle css imported from them (and descendants).
* `StylesCache` and `Applicatione.getStylesCache` were removed. Instead, dev server now handles its cache.
* As as result, dev server performance was noticeably improved.
* Dev server no longer runs `postcss.extraPlugins` against project css files.
* Build process now processes CSS files after bundling. This significantly improved CSSO effectiveness.

### Framework
* `Container.setTheme` and `Container.getTheme` were deprecated

## 2.1.3 (release date: 15.08.2019)

### Tools 
* Fix some cyclical dependencies introduced by jsdoc comments

## 2.1.2 (release date: 14.08.2019)

* Quell a GCC warning

## 2.1.1 (release date: 09.08.2019)

Updated ESLint to 6.0 and added new plugins and rules

### Tools

* Updated Closure Compiler to 20190729.0.0

## 2.1.0 (release date: 23.07.2019)

### Framework:

* Added `StateMachine` class.
* `.zb-video-container` element was removed from base framework. This resulted in following API changes:
    * `Application.getVideoContainer()` public method and `_videoContainer` protected property were deprecated
    * `AbstractDevice` no longer takes `HTMLElement` in its constructors
    * `IDevice` and `AbstractDevice` now expect a `Rect` argument in `createVideo`
    * `AbstractVideo` now requires a `Rect` argument in constructor
    
    All methods have fallbacks for backward compatibility and should work if used with old code, but produce compile-time warnings and console errors.
    See [Migration doc](./docs/migrations/2.1.0.md) for more details.  
* `Application.getBody` method was added.

## 2.0.2 (release date: 18.06.2019)

#### Tools
* Fixed another exception in `BuildHelper.addDirToArchiveMap` method.
* Moved `setTemplateHelper` method to `AbstractAddon` to allow platform use it in addition to extensions.

## 2.0.1 (release date: 13.06.2019)

#### Tools
* Fixed exception in `BuildHelper.addDirToArchiveMap` method.
* Added `setTemplateHelper` method to `AbstractExtension` and exposed `TeamplateHelper` class for imports. 

## 2.0.0 (release date: 03.06.2019)

No changes since `rc.2`.

**Major incompatible changes since `1.0`** – see change log below and [migration document](./docs/migrations/2.0.0.md).

## 2.0.0-rc.2 (release date: 03.06.2019)

#### Tools
* Updated Closure Compiler to v20190528

## 2.0.0-rc.1 (release date: 30.05.2019)

License was changed from GPLv3 to MIT.

#### Tools
* Fixed config validation rejecting PostCSS plugins in `extraPlugins` field.

## 2.0.0-alpha.8 (release date: 23.05.2019)

#### Tools
* Updated Closure Compiler to 20190513
* Fixed several minor issues in config schema
* `generatedCode` and `project.dist` directories are no longer required to exist. Build scripts will automatically create them when necessary.

## 2.0.0-alpha.7 (release date: 26.04.2019)

#### Tools
* Fix CLI `--config` argument parsing.
* Return empty result from `AbstractExtension.generateCode` allowing extensions not to redefine this method.

## 2.0.0-alpha.6 (release date: 25.04.2019)

#### Tools
* Add `ISourceProvider` to package exports.

## 2.0.0-alpha.5 (release date: 23.04.2019)

Technical release to fix an exception in previous release.

## 2.0.0-alpha.4 (release date: 23.04.2019)

#### Tools:
* **BREAKING**: Config structure was drastically reworked and is fully incompatible with previous versions. See [configuration](docs/configuration.md)
* Config JSON schema was introduced and is used for config validation, type checking and documentation generation.
* Package `main` was changed from `ZBApplication` to index.js file aggregating framework classes. ZBApplication is now available as `require('zombiebox').Application`. 
* `Application.getAllConfigs` method was removed. Use `getConfig` and `getAppPackageJson` instead
* `Application.getPathInfo` was renamed to `Application.getPathHelper`
* `BuildHelper.getCompressedStyles` resource destination path argument is now mandatory
* Added `zb` as alias for `zombiebox` CLI
* Fixed a game-breaking typo in StylesCache
* Several instances of `packageConfig` variables referring to package.json files were renamed to `packageJSON`
    * `Application.getAppPackageConfig` to `Application.getAppPackageJson`
    * `Application.getZBPackageConfig` to `Application.getZbPackageJson`
    * `Loader.loadFromPackageConfig` to `Loader.loadFromPackageJson`
    * `Loader.getPackageConfigs` to `Loader.getPackageJsons`

#### Framework:
* `AbstractTransport` now has a `REQUEST_PARAMS` template. `doRequest` and `doPersistentRequest` accept it as the only argument. Error handler now also receives it. This is only partially backwards compatible, see [migration document](docs/migrations/2.0.0.md).

## 2.0.0-alpha.3 (release date: 26.03.2019)

#### Framework:
* Added principal axis navigation support

#### Tools:
* CLI was refactored. `zb-cli` is now deprecated. Use `npx zombiebox` (or `npx zb`) to access ZombieBox CLI from projects.
* **BREAKING**: `postcss-cssnext` was replaced with `postcss-preset-env`. CSS features support was dropped to stage 3 only.

## 2.0.0-alpha.2 (release date: 06.03.2019)

#### Framework:
* CuteJS was removed from framework and moved into zombiebox-extension-cutejs; See extension's MIGRATION.md
* Removed some deprecated APIs:
	* `zb/client-rect`
	* `AbstractInput.pointingDeviceEnable`
	* `AbstractInput.pointingDeviceDisable`
	* `AbstractViewPort.hasFeatureAspectRatio`
	* `IInput.pointingDeviceEnable`
	* `IInput.pointingDeviceDisable`
	* `IViewPort.hasAspectRatioFeature`
	* `zb/device/aspect-ratio/proportion.js`: `Common.x4x3` 
	* `zb/device/aspect-ratio/proportion.js`: `Common.x16x9` 

#### Tools:

* Node 6.0 support dropped. Minimal supported version is now 8.9 LTS.
* Removed some deprecated APIs:
	* `ZBBuildHelper.setDefineArgs`
	* `ZBBuildHelper.writeIndexHtml`
	* `ZBBuildHelper.copyCustomWebFiles`
	* `ZBPath.getCCDir`
	* `ZBPath.getWebDir`
	* `ZBPath.getDevJs`
	* `ZBApplication.getCustomWebFiles`
	* `Scaffolding.renderIndexHTML`
	
## 2.0.0-alpha.1 (release date: 12.20.2019)

**Major breaking change**: ECMAScript modules support added and framework code migrated to modules. See [migration document](docs/migrations/2.0.0.md).

#### Framework:

Code base migrated to modules.

#### Tools:

* CSS resource inlining is rewritten from custom implementation to [postcss-url](https://github.com/postcss/postcss-url).
* CSS minimizing now also done though postcss [CSSO plugin](https://github.com/css/csso)
* Scaffolding commands (`zb addScene` et al) no longer accept base class parameter
* ZombieBox version used for compilation is now always the same that application depends on, regardless of what ZombieBox version build scripts are used to run it.  
* Several methods and their signatures changed:
	* Removed: `ZBApplication.getCodeSources`
	* Removed: `ZBApplication.getAppScripts`
	* Removed: `AddonLoader.getAddonWebPath`
	* Changed: `ZBApplication.getStyles` – no longer accepts parameters
	* Changed: `ZBApplication.getSortedStyles` – no longer accepts parameters
	* New: `ZBApplication.getGeneratedEntryPoint`
	* New: `ZBApplication.getAliases`
	* New: `ZBApplication.recalculateAliases`
	* New: `ZBApplication.aliasedPathToFsPath`
	* New: `ZBApplication.fsPathToAliasedPath`
	* Renamed: `SourceProviderCodeCache.generateDefine` to `SourceProviderCodeCache.generateDefines`
	* Deprecated: `ZBApplication.getCustomWebFiles` in favor of `getStaticFiles`
	* Deprecated: `ZBApplication.copyCustomWebFiles` in favor of `copyStaticFiles`
	* Deprecated: `ZBApplication.getCCDir` in favor of corresponding config field
	* Deprecated: `ZBApplication.getWebDir` in favor of corresponding config field
	* Deprecated: `ZBApplication.getDevJs` in favor of corresponding config field

## 1.0.1 (release date: 04.02.2019)

* Fix GCC warning in zb.device.aspectRatio.Proportion

## 1.0.0 (release date: 31.01.2019)

No changes, functionally the same as `1.0.0-beta6`

## 1.0.0-beta6 (release date: 24.01.2019)

#### Tools:

* Dev server and version checker split from `ZBApplication` into their own classes
* Updated dependencies:
  * google-closure-compiler@20190121.0.0
  
#### Framework:

* `zb.clientRect.Rect` and `zb.device.AbstractViewPort.Rect` deprecated in favor of `zb.clientRect.Rect`; All interfaces that used them were changed
* `zb.define.console.ENABLE_CONSOLE` renamed to `zb.define.ENABLE_CONSOLE`
* `zb.InputDispatcher` constructor now accepts `zb.IKeyHandler`
* `HTML5Video` now also handles `<source>` errors
* `zb.std.plain.Rect.extrapolate` optimisation
* Added static methods `createHorizontalInfiniteRect` and `createVerticalInfiniteRect`  to `zb.std.plain.Rect`
* Removed some unnecessary polyfills

## 1.0.0-beta5 (release date: 09.09.2018)

#### Tools:

* Updated dependencies:
	* google-closure-compiler@20180805.0.0
	* zb-log-server@0.0.6
	* zb-utils@0.1.8
	* css@2.2.4
	* postcss@7.0.2
	* chalk@2.4.1 instead of colors@1.3.0
	* archiver@3.0.0
	* yargs@12.0.2
	* eslint@5.5.0
	* eslint-config-interfaced@1.2.0
	* eslint-plugin-interfaced@1.2.0
	* semver@5.5.1
	* karma@2.0.5
	* sinon@6.2.0

## 1.0.0-beta4 (release date: 08.09.2018)

#### Tools:

* Dynamic defines by a new config key `define`, as a successor of `compilation.flags.define`, but working not only in compilation
* External scripts and styles adding by new config keys `scripts.external` and `styles.external`
* Scripts excluding by a new config key `scripts.exclude`
* Including of custom files to the build by `build.include`
* Passing of a specific config key through CLI (e.g. `--config.compilation.level '"SIMPLE_OPTIMIZATIONS"'`)
* Synchronous addons loading
* Introduced a new addon method `setApplication()`
* Removed CLI option `--enableConsole`. To achieve the same behaviour consider `--config.define.console.ENABLE_CONSOLE`
* Removed CLI option `--platform` in favor of more generic `--addon`
* Removed generation of `zb.device.ResolutionInfo`. Also removed the related config key `resolution`
* Removed DI functionality in favor of an extension (see the [migration guide](docs/migrations/dependency-injection.md) for details).
Also removed the related config keys `services` and `servicesAutodetect`
* Renamed some config keys (you still can use the old ones, but in this case the deprecation warning will appear):
	- `scripts` -> `compilation.include`
	- `styles` -> `styles.include`
	- `jsLibs` -> `scripts.include`
	- `stylesExclude` -> `styles.exclude`
	- `stylesOrder` -> `styles.order`
	- `stylesTransformOptions` -> `styles.postcss.cssnextOptions`
	- `stylesPlugins` -> `styles.postcss.plugins`
	- `build.inlineCSSResources` -> `styles.inlineResources`

#### Framework:

* Extended enum `zb.http.Method`
* Reworked `zb.xhr.simple.send` to be more flexible
* Normalize the input value in `zb.device.platforms.common.HTML5Video#setVolume()`
* Renamed `zb.console.ENABLE_CONSOLE` (to `zb.define.console.ENABLE_CONSOLE`) and now it's set to `true` by default
* Removed `PAL` resolution support

## 1.0.0-beta3 (release date: 03.07.2018)

#### Tools:

* Dead code elimination improvement
* Peer dependencies check skipping by a new config key `skipVersionsCheck`
* Fixed typo in the wrapping of console's methods
* Closure Compiler `v20180506.0.0`

#### Framework:

* Optimization for `zb.html.text()`
* Abstract `zb.widgets.BaseNavigation` (renamed to `zb.widgets.AbstractNavigation`)
* Separated `zb.widgets.Navigation` to `zb.widgets.SpatialNavigation` and `zb.widgets.OrderNavigation`
* Disallow `widgetTo` to be `boolean` in `zb.widgets.Container#setNavigationRule()`
* Removed unused events: `zb.Application#EVENT_SCENE_SHOWN`, `zb.Application#EVENT_SCENE_HIDDEN`, `zb.widgets.IWidget#EVENT_WANT_BLUR`
* Prevent warnings about non-passive mouse wheel listener
* Fixed an exception during drawing of a debug navigation line

## 1.0.0-beta2 (release date: 19.04.2018)

#### Tools:

* Event based handling of the loaded extensions
* PostCSS plugins passing by a new config key `stylesPlugins`
* Removed Babel
* Closure Compiler `v20180402.0.0`

#### Framework:

* Check whether the default widget is focusable when a container gets focus
* Prolong pointer idle timeout by click and wheel events
* Reworked the warning about listeners cloning during the execution phase
* Clone listeners for `zb.events.EventPublisher#EVENT_ANY`
* Added `zb.layers.Layer#_removeContainerClass()`
* Added `zb.widgets.Widget#_addContainerClass()`
* Added `zb.widgets.Widget#_removeContainerClass()`

## 1.0.0-beta1 (release date: 06.02.2018)

#### Tools:

* Added code generation by the loaded extensions with a special method `generateCode()`
* Peer dependencies check
* Introduced CSSNext alongside with a new config key `stylesTransformOptions`
* Deprecated `compilation.autoprefixer` config key
* Unified report for errors and warnings
* Extract compilation info from a build output
* Set `zombiebox-platform-pc` as a peer dependency
* Package lock file
* Closure Compiler `v20180101.0.0`

#### Framework:

* Abstract `zb.device.Device` (renamed to `zb.device.AbstractDevice`)
* Abstract `zb.device.Input` (renamed to `zb.device.AbstractInput`)
* Abstract `zb.device.ViewPort` (renamed to `zb.device.AbstractViewPort`)
* Renamed `zb.device.Info` (to `zb.device.AbstractInfo`)
* Added `zb.device.error.UnsupportedFeature`
* Added chromakey methods to `zb.device.IDevice`
* Deprecated `zb.device.IViewPort#hasFeatureAspectRatio()`
* Deprecated `zb.device.IInput#pointingDeviceEnable()` and `zb.device.IInput#pointingDeviceDisable()`
* Marked all abstract methods that can throw `zb.device.error.UnsupportedFeature` by `@throws`
* Return from `zb.device.IVideo#forward()`
* Nullable return from `zb.device.IViewPort#getArea()`
* Consider `zb.device.platforms.common.HTML5Video#forward()`/`zb.device.platforms.common.HTML5Video#rewind()` successful when no exception was thrown
* Fixed GCC warnings in `zb.xhr.Transport`

## 1.0.0-alpha12 (release date: 06.02.2018)

#### Tools:

* Fixed mime type for `base64`

## 1.0.0-alpha11 (release date: 27.11.2017)

#### Tools:

* Added CLI option `--platform` for connecting platform by a path

#### Framework:

* Added `zb.device.platforms.common.LocalStorage.isSupported()` (static)
* Removed legacy `zb.device.AbstractVideo_matchStateToEvent()`
* Separate file for namespace `zb.device.input.Keys`
* Renamed `x4x3` to `X4X3` in enum `zb.device.aspectRatio.Proportion.Common`

#### Other:

* Added design materials

## 1.0.0-alpha10 (release date: 13.10.2017)

#### Framework:

* Don't pass `null` to `window.history.pushState()` in `zb.BackButtonListener`

## 1.0.0-alpha9 (release date: 11.10.2017)

#### Framework:

* Fixed GCC warnings in `zb.BackButtonListener`

## 1.0.0-alpha8 (release date: 11.10.2017)

#### Framework:

* Complete BCP 47 pattern for locale validating
* Extended `zb.device.IInput` by IDLE methods

## 1.0.0-alpha7 (release date: 10.10.2017)

#### Tools:

* Fixed polyfill for `Array.prototype.find()` (see https://github.com/termi/ES5-DOM-SHIM/issues/9)
* Removed support of `.es6` extensions
* Invalidate transpiler cache for `.code-cache` files

#### Framework:

* Described edge cases of `zb.BackButtonListener`
* Unsubscribe only a certain once listener
* Unsubscribe once listeners in `zb.events.EventPublisher#removeAllListeners()`

## 1.0.0-alpha6 (release date: 18.07.2017)

#### Tools:

* Display the file path when DI or autoprefixer throw an exception
* Prevent false positive transpiling headers

#### Framework:

* Added `zb.widgets.Container#activateNearestWidget()`
* Fixed a bunch of ESLint warnings

## 1.0.0-alpha5 (release date: 25.05.2017)

#### Tools:

* Removed polyfill for `Promise`
* Removed typedefs for `IThenable` and `JSON`
* Fixed incorrect path resolving on Windows

#### Framework:

* Abstract `zb.device.Info`
* Fixed some contradictory access modifiers
* Reject a promise returned from `zb.LayerManager#open()` when layer throws an error
* Removed definition of the private method in `zb.events.IEventPublisher`

## 1.0.0-alpha4 (release date: 27.04.2017)

#### Tools:

* Added CLI option `---config` and deprecated `--custom-config`
* Don't treat any file with name `app.js` as `/app.js` endpoint for a bundled code
* Don't left unused `<link href="...">` in a build
* Prevent permanent `dev.js` transpiling

#### Framework:

* Disable text selection by default

## 1.0.0-alpha3 (release date: 24.04.2017)

#### Tools:

* Ability to turn off the inlining of css resources by a new config key `inlineCSSResources`
* Bundler for transpiling alongside with `/es6` endpoint for untranspiled code
* Extracted the parts of build process (dev server, transpiler, extensions loader, scaffolding) to modules
* Server side code moved to ES6
* Closure Compiler `v20170218.0.0`

#### Framework:

* Added `zb.device.IInfo#locale()`
* Added `zb.device.IDevice#getLaunchParams()`
* Added `zb.Timeout#isInProgress()`
* Set viewport full screen mode by default

## 1.0.0-alpha2 (release date: 06.03.2017)

#### Other:

* Use "zombiebox.tv" instead of "zombiebox.net" as a link to the site

## 1.0.0-alpha1 (release date: 06.03.2017)

* ZombieBox was bumped to 1.0.0!
