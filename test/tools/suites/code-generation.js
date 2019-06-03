const fs = require('fs');
const path = require('path');
const {expect} = require('chai');
const TemporaryApplicationContainer = require('../temporary-application-container');


describe('Code generation', () => {
	let appContainer;
	let app;

	before(async() => {
		appContainer = new TemporaryApplicationContainer();
		await appContainer.init();

		app = appContainer.createZbApplication([
			{
				define: {
					string: 'foo',
					number: 30,
					object: {
						boolean: true,
						number: 0
					},
					several: {
						layers: {
							deep: {
								number: 10
							}
						}
					},
					emptyObject: {},
					undefined: undefined,
					nullValue: null,
					stringArray: ['zero', 'one', 'two'],
					numbersArray: [1, 2],
					mixedArray: ['zero', true, 2],
					arrayArray: [
						[1],
						[2, 3]
					],
					mixedArrayArray: [
						['foo'],
						[2, 3]
					],
					objectArray: [
						{
							string: 'foo'
						},
						{
							string: 'bar'
						}
					],
					emptyArray: [],
					functionValue: () => 0
				}
			}
		], [
			path.join(__dirname, '..', 'fixtures', 'zombiebox-platform-tamagotchi'),
			path.join(__dirname, '..', 'fixtures', 'zombiebox-extension-blockchain')
		]);
		await app.ready();
		await app.buildCode();
	});

	after(async() => {
		await appContainer.cleanup();
	});

	it('Should generate a package info', async() => {
		expect(await appContainer.readFile('.generated/package-info.js'))
			.equal(readFileFromReferences('package-info.js'));
	});

	it('Should generate an entry point', async() => {
		expect(await appContainer.readFile('.generated/app.js'))
			.equal(readFileFromReferences('app.js'));
	});

	it('Should generate a base application class', async() => {
		expect(await appContainer.readFile('.generated/base-application.js'))
			.equal(readFileFromReferences('base-application.js'));
	});

	it('Should generate defines', async() => {
		expect(await appContainer.readFile('.generated/define.js'))
			.equal(readFileFromReferences('define.js'));
	});

	it('Should generate extensions code', async() => {
		expect(await appContainer.readFile('.generated/blockchain/private-key'))
			.equal(readFileFromAddonFixturesFixtures('zombiebox-extension-blockchain/private-key'));
	});
});

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileFromReferences(filePath) {
	return fs.readFileSync(path.join(__dirname, '..', 'references', 'code-generation', filePath), 'utf-8');
}

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileFromAddonFixturesFixtures(filePath) {
	return fs.readFileSync(path.join(__dirname, '..', 'fixtures', filePath), 'utf-8');
}
