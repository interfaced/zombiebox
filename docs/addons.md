# ZombieBox Addons

ZombieBox functionality can be extended with Addons. Currrently there are two types of addons: Platforms and Extensions.

**Platforms** add an implementation of hardware layer abstraction for a specific set of devices. Their core are implementations of [`IDevice`](../zb/device/interfaces/i-device.js), [`IVideo`](../zb/device/interfaces/i-video.js), [`IInfo`](../zb/device/interfaces/i-info.js) and [`IInput`](../zb/device/interfaces/i-input.js) interfaces, scripts that build application into platform-specific artifact (e.g. binary package).

**Extensions** typically add new functionality to client-side runtime code base (e.g. widgets, utilities). Extensions can also generate new code based on existing code base.

**Both** Platforms and Extensions can add CLI commands, add client-side code, include additional files into build and influence project configuration.

## Installing addons

Addons are loaded from application `package.json` file. To add an addon, simply install it with npm:

```bash
npm install zombiebox-platform-foo
npm install zombiebox-extension-bar
```

By convention, Platform package name are prefixed with `zombiebox-platform-` and Extension's with `zombiebox-extension-`. ZombieBox scans for project dependencies prefixed with `zombiebox-` and treats them as addons.

See npm for list of publicly available [platforms](https://www.npmjs.com/search?q=zombiebox-platform) and [extensions](https://www.npmjs.com/search?q=zombiebox-extension).

## Using addons

Each addons implements [`AbstractAddon`](../lib/addons/abstract-addon.js) and its subclasses ([`AbstractPlatform`](../lib/addons/abstract-platform.js) or [`AbstractExtension`](../lib/addons/abstract-extension.js)) which dictate three basic properties: Name, source directory and config.

Addon name should be a unique identifier. For convention npm package name is typically named same as addon name with appropriate prefix.

Source directory is the location of client-side files to be included into build. Its root will be aliases as addon name.

Addon config can both change global project configuration and introduce its own configuration under `platforms` or `extensions` fields. See [configuration](./configuration.md) for more details.

## Developing addons

Each addon must have a CommonJS module providing a class inheriting from `AbstractAddon` (`AbstractPlatform`, `AbstractExtension`) referenced in its `package.json` as `main` and implementing its abstract methods.
