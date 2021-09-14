const path = require('path');
const stripAnsi = require('strip-ansi');
const {expect} = require('chai');
const {stub} = require('sinon');
const TemporaryApplicationContainer = require('../temporary-application-container');

const currentZBVersion = require('../../../package').version;
const tamagotchiPlatformPath = path.join(__dirname, '..', 'fixtures', 'zombiebox-platform-tamagotchi');
const {AbstractPlatform} = require('../../../lib/addons/abstract-platform');

describe('Starting', () => {
	let appContainer;

	beforeEach(async () => {
		appContainer = new TemporaryApplicationContainer();
		await appContainer.init();
	});

	afterEach(async () => {
		await appContainer.cleanup();
	});


	it('Should load the default config when no custom was given', () => {
		const app = appContainer.createZbApplication([], []);

		expect(app.getConfig().devServer.port).equal(7777);
	});

	describe('Versions check', () => {
		it('Should throw an error when the versions check fails', async () => {
			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '0.0.0',
					'zombiebox-platform-pc': '*'
				}
			}));

			expect(() => appContainer.createZbApplication([]))
				.throw(Error).and.satisfy((err) => stripAnsi(err.message) === (
					`Installed version ${currentZBVersion} of zombiebox is incompatible ` +
					`with the required by test range 0.0.0.\n` +
					`Install a compatible with range 0.0.0 version of zombiebox and try again.`
				));
		});

		it('Should be able to skip the versions check', async () => {
			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '0.0.0',
					'zombiebox-platform-pc': '*'
				}
			}));

			expect(() => appContainer.createZbApplication([{skipVersionsCheck: true}])).not.throw();
		});

		it('Should not throw an error when the required version range isn\'t valid', async () => {
			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '_',
					'zombiebox-platform-pc': '*'
				}
			}));

			expect(() => appContainer.createZbApplication([])).not.throw();
		});

		it('Should recognize the semantic versioning', async () => {
			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '^0.0.0 ~0.0.0 <=0.0.0',
					'zombiebox-platform-pc': '*'
				}
			}));

			expect(() => appContainer.createZbApplication([]))
				.throw(Error).and.satisfy((err) => stripAnsi(err.message) === (
					`Installed version ${currentZBVersion} of zombiebox is incompatible ` +
					`with the required by test range ^0.0.0 ~0.0.0 <=0.0.0.\n` +
					`Install a compatible with range ^0.0.0 ~0.0.0 <=0.0.0 version of zombiebox and try again.`
				));
		});

		it('Should check peer dependencies of the loaded addons', async () => {
			await appContainer.installDependency('zombiebox-platform-tamagotchi', tamagotchiPlatformPath, true);
			await appContainer.writeFile('node_modules/zombiebox-platform-tamagotchi/package.json', JSON.stringify({
				name: 'zombiebox-platform-tamagotchi',
				peerDependencies: {
					'zombiebox': '0.0.0'
				}
			}));

			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '*',
					'zombiebox-platform-pc': '*',
					'zombiebox-platform-tamagotchi': '*'
				}
			}));

			expect(() => appContainer.createZbApplication([]))
				.throw(Error).and.satisfy((err) => stripAnsi(err.message) === (
					`Installed version ${currentZBVersion} of zombiebox is incompatible ` +
					`with the required by zombiebox-platform-tamagotchi range 0.0.0.\n` +
					`Install a compatible with range 0.0.0 version of zombiebox and try again.`
				));
		});
	});

	describe('Addons', () => {
		it('Should load addons by the application package info', async () => {
			await appContainer.installDependency('zombiebox-platform-tamagotchi', tamagotchiPlatformPath);

			await appContainer.writeFile('package.json', JSON.stringify({
				name: 'test',
				dependencies: {
					'zombiebox': '*',
					'zombiebox-platform-pc': '*',
					'zombiebox-platform-tamagotchi': '*'
				}
			}));

			const app = appContainer.createZbApplication([]);

			expect(app.getPlatforms().find((platform) => platform.getName() === 'tamagotchi')).ok;
		});

		it('Should load addons by a file path', async () => {
			const app = appContainer.createZbApplication([], [tamagotchiPlatformPath]);

			expect(app.getPlatforms().find((platform) => platform.getName() === 'tamagotchi')).ok;
		});

		it('Should load addons by an instance', async () => {
			const tamagotchiInstance = createTamagotchiPlatform();
			const app = appContainer.createZbApplication([], [tamagotchiInstance]);

			expect(app.getPlatforms().find((platform) => platform.getName() === 'tamagotchi')).ok;
		});

		it('Should extend config by the loaded addon', async () => {
			const tamagotchiInstance = createTamagotchiPlatform();
			stub(tamagotchiInstance, 'getConfig').returns({
				include: [
					{externalScripts: ['$MAGIC$/video.js']}
				]
			});

			const app = appContainer.createZbApplication([], [tamagotchiInstance]);

			expect(app.getConfig().include.find(
				(entity) => entity.externalScripts && entity.externalScripts.join('') === '$MAGIC$/video.js')
			).to.be.ok;
		});

		it('Should throw an error when cannot load addon by the file path', async () => {
			expect(() => appContainer.createZbApplication([], ['/does-not-exist/addon.js'])).throw('Can\'t load addon');
		});

		it('Should throw an error when trying to pass a not addon instance', async () => {
			expect(() => appContainer.createZbApplication([], [{}]))
				.throw('Trying to add not an addon: [object Object] (unknown name)');
		});

		it('Should throw an error when trying to load the same addon twice', async () => {
			expect(() => appContainer.createZbApplication([], [tamagotchiPlatformPath, tamagotchiPlatformPath]))
				.throw('Addon with name');
		});
	});
});

/**
 * @return {AbstractPlatform}
 */
function createTamagotchiPlatform() {
	// eslint-disable-next-line node/global-require
	return new (require(tamagotchiPlatformPath))();
}
