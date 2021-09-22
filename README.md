# ZombieBox

ZombieBox is a JavaScript framework for development of Smart TV and STB applications.

## Why ZombieBox?

* It's cross-platform;
* It leverages a strongly typed JavaScript by [Google Closure Compiler](https://developers.google.com/closure/compiler/) and modern ECMAScript;
* It provides a set of typical solutions for TV, such as spatial navigation or remote logging;
* It produces a fast application that has a small size and a minimum of 3rd party code;

## Getting started

Init a node.js project:

```bash
npm init
```

Install ZombieBox and some of its components that you will most likely need:

```bash
npm install zombiebox
npm install zombiebox-platform-pc zombiebox-extension-cutejs
```

Either create application `config.js` manually and start developing or start with a boilerplate:

```bash
npx zombiebox init $NAME

# or without npx:
./node_modules/zombiebox/bin/cli.js init
```

Run the development server:

```bash
npx zombiebox run
```

## Platforms

ZombieBox supports a lot of modern Smart TV and STB platforms and also some legacy but high-demand platforms, which allows you to deliver your application to a wide number of devices.
Any capable platform can be easily support by extending it.

Platforms are a subtype of ZombieBox Addon. See [addons](docs/addons.md) for more information.

List of supported platforms:

| Platform | Package | Version |
|----------|---------|---------|
| Desktop browsers          | [`zombiebox-platform-pc`][ab]         | ![](https://img.shields.io/npm/v/zombiebox-platform-pc/latest.svg) |
| Android TV                | [`zombiebox-platform-android-tv`][ac] | ![](https://img.shields.io/npm/v/zombiebox-platform-android-tv/latest.svg) |
| Samsung Tizen (2015+)     | [`zombiebox-platform-tizen`][ad]      | ![](https://img.shields.io/npm/v/zombiebox-platform-tizen/latest.svg) |
| Samsung Orsay (2012-2014) | [`zombiebox-platform-samsung`][ae]    | ![](https://img.shields.io/npm/v/zombiebox-platform-samsung/latest.svg) |
| LG webOS (2014+)          | [`zombiebox-platform-webos`][af]      | ![](https://img.shields.io/npm/v/zombiebox-platform-webos/latest.svg) |
| LG NetCast (2012-2014)    | [`zombiebox-platform-lg`][ag]         | ![](https://img.shields.io/npm/v/zombiebox-platform-lg/latest.svg) |
| MAG STB                   | [`zombiebox-platform-mag`][ah]        | ![](https://img.shields.io/npm/v/zombiebox-platform-mag/latest.svg) |
| Dune HD                   | [`zombiebox-platform-dune`][ai]       | ![](https://img.shields.io/npm/v/zombiebox-platform-dune/latest.svg) |

Archived platforms:

| Platform | Package | Version |
|----------|---------|---------|
| Headless browsers | [`zombiebox-platform-headless`][aj] | ![](https://img.shields.io/npm/v/zombiebox-platform-headless/latest.svg) |
| Eltex STB         | [`zombiebox-platform-eltex`][ak]    | ![](https://img.shields.io/npm/v/zombiebox-platform-eltex/latest.svg) |
| TVIP STB          | [`zombiebox-platform-tvip`][al]     | ![](https://img.shields.io/npm/v/zombiebox-platform-tvip/latest.svg) |

[ab]: https://www.npmjs.com/package/zombiebox-platform-pc
[ac]: https://www.npmjs.com/package/zombiebox-platform-android-tv
[ad]: https://www.npmjs.com/package/zombiebox-platform-tizen
[ae]: https://www.npmjs.com/package/zombiebox-platform-samsung
[af]: https://www.npmjs.com/package/zombiebox-platform-webos
[ag]: https://www.npmjs.com/package/zombiebox-platform-lg
[ah]: https://www.npmjs.com/package/zombiebox-platform-mag
[ai]: https://www.npmjs.com/package/zombiebox-platform-deune
[aj]: https://www.npmjs.com/package/zombiebox-platform-headless
[ak]: https://www.npmjs.com/package/zombiebox-platform-eltex
[al]: https://www.npmjs.com/package/zombiebox-platform-tvip

Installation of a new platform is easy and nothing more than installation of a new npm package with further saving in the dependencies.

For example, for LG Netcast platform:

```bash
npm i zombiebox-platform-lg --save
```

Then configure the installed platform for building of a distribution package:

```javascript
// Your config.js

module.exports = () => ({
	platforms: {
		lg: {
			// Some platform-specific configuration, see platform documentation
		}
	}
});
```

Finally, build a package:

```bash
npx zombiebox build lg
```

## Extensions:

Extension is a special npm package that extends default functionality of the framework.
To add an extension just install a package via npm and save it in the dependencies.

Extensions are a subtype of ZombieBox Addon. See [addons](docs/addons.md) for more information.

List of available extensions:

| Description | Package | Version |
|-------------|---------|---------|
| CuteJS Template engine                     | [`zombiebox-extension-cutejs`][ba]               | ![](https://img.shields.io/npm/v/zombiebox-extension-cutejs/latest.svg) |
| Set of basic TV-oriented components        | [`zombiebox-extension-ui`][bb]                   | ![](https://img.shields.io/npm/v/zombiebox-extension-ui/latest.svg) |
| Dependency Injection                       | [`zombiebox-extension-dependency-injection`][bc] | ![](https://img.shields.io/npm/v/zombiebox-extension-dependency-injection/latest.svg) |
| I18n support                               | [`zombiebox-extension-i18n`][bd]                 | ![](https://img.shields.io/npm/v/zombiebox-extension-i18n/latest.svg) |
| Tools for Pixel Perfect testing            | [`zombiebox-extension-pixelperfect`][be]         | ![](https://img.shields.io/npm/v/zombiebox-extension-pixelperfect/latest.svg)  |
| Popup with main info about the application | [`zombiebox-extension-about`][bf]                | ![](https://img.shields.io/npm/v/zombiebox-extension-about/latest.svg) |
| Lodash library integration                 | [`zombiebox-extension-lodash`][bg]               | ![](https://img.shields.io/npm/v/zombiebox-extension-lodash/latest.svg) |
| Environment for interactive UI development | [`zombiebox-extension-storybook`][bh]            | ![](https://img.shields.io/npm/v/zombiebox-extension-storybook/latest.svg) |
| Emoji support                              | [`zombiebox-extension-emoji`][bi]                | ![](https://img.shields.io/npm/v/zombiebox-extension-emoji/latest.svg) |
| Subtitles                                  | [`zombiebox-extension-ui-subtitles`][bj]         | ![](https://img.shields.io/npm/v/zombiebox-extension-ui-subtitles/latest.svg) |


[ba]: https://www.npmjs.com/package/zombiebox-extension-cutejs
[bb]: https://www.npmjs.com/package/zombiebox-extension-ui
[bc]: https://www.npmjs.com/package/zombiebox-extension-dependency-injection
[bd]: https://www.npmjs.com/package/zombiebox-extension-i18n
[be]: https://www.npmjs.com/package/zombiebox-extension-pixelperfect
[bf]: https://www.npmjs.com/package/zombiebox-extension-about
[bg]: https://www.npmjs.com/package/zombiebox-extension-lodash
[bh]: https://www.npmjs.com/package/zombiebox-extension-storybook
[bi]: https://www.npmjs.com/package/zombiebox-extension-emoji
[bj]: https://www.npmjs.com/package/zombiebox-extension-ui-subtitles

## Configuration

Configuration file is a module that exports a function returning configuration object.

By default, the framework will try to find file `config.js` in the root of the project, but you can set a custom path passing `--config` to the CLI commands.

See [configuration](docs/configuration.md) for details. 

## CLI commands

Use npx to access ZombieBox CLI utility: `npx zombiebox` or `npx zb`.

* `npx zb init <name> [root]` - generates skeleton of a project interactively
* `npx zb run` - starts the development server
* `npx zb build <platforms..>` - builds a distribution package
* `npx zb buildCode` - generates runtime code
* `npx zb (addScene|addPopup|addWidget) <name> [path]` - generates boilerplate code for UI components
* `npx zb generateAliases [filename]` - generates alias map for development tools
* `npx zb <platform> <command>` - runs a specific command provided by a specific platform

## Change log

See the [CHANGELOG.md](CHANGELOG.md).

## Version policy

ZombieBox is not semver compatible. We tried, but this wasn't working well. ZombieBox tries it's best to follow a version policy close to semver that makes sense.

* Major versions denote major changes in code structure and APIs. It's probably either a brand new framework or requires extensive migration if major version changed.
* Minor versions mean new features. There might be **breaking changes in minor versions**, but they likely require minor migrations like changing methods order, signatures or replacing one component with another equivalent. These should be documented in [CHANGELOG.md](CHANGELOG.md) and [migratiosn](./docs/migrations) docs.
* Patch versions do not introduce breaking changes and either fix bugs or add neglectable improvements in non-breaking way.
* Pre-release versions are meant to contain experimental features that are going to be introduced later and are likely to break compatibility and be generally unstable. These are only pushed to `@dev` dist-tag.

All ZombieBox components declare their dependencies on each other with `peerDependencies` field in package.json. Node itself does not enforce this field, but ZombieBox does in its CLI commands.

## Behind ZombieBox

ZombieBox was developed and is maintained by [Interfaced](https://interfaced.tv).

It was created as internal framework for numerous Smart TV and STB [applications](https://interfaced.tv/projects.html) developed for industry leaders. 

## License

This library is distributed under MIT license. See [LICENSE](LICENSE).

Copyright © 2012-2021, Interfaced. All rights reserved.
If you have any questions about license, please write to [licensing@zombiebox.tv](mailto:licensing@zombiebox.tv).
