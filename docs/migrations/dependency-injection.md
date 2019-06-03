# Dependency Injection

Dependency Injection was removed from ZombieBox and re-implemented as `zombiebox-extension-dependency-injection`. Its functionality remains the same.

## Steps to migrate:

 * Add `zombiebox-extension-dependency-injection` to dependencies in `package.json`
 * Move DI config fields `services` and `servicesAutodetect` to `di` subfield.

```js
		module.exports = () => {
			di: {
				services: { /* ... */ },
				servicesAutodetect: { /* ... */ }
			}
		}
```

 * Instantiate and init `BaseServiceContainer`.

```js
		class Application {
			constructor () {
				/**
				 * @type {app.BaseServiceContainer}  
				 */
				this.sc;
			}

			/**
			 * @override
			 */
			onReady() {
				this.sc = new app.BaseServiceContainer(this);
				this.sc.bootstrap();
			}
		}
```
