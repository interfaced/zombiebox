const fs = require('fs');
const path = require('path');
const got = require('got');
const portfinder = require('portfinder');
const {expect} = require('chai');
const TemporaryApplicationContainer = require('../temporary-application-container');


const isLocal = (filename) =>
	filename.startsWith('./') ||
	filename.startsWith('../') ||
	filename.startsWith('/');

const replaceAliasedPaths = (content) => content.replace(
	/ from '(.+?)';/g,
	(match, importPath) => isLocal(importPath) ?
		match :
		` from '/modules/${importPath}';`
);


describe('Server', () => {
	let httpPort;
	let appContainer;
	let app;

	before(async () => {
		appContainer = new TemporaryApplicationContainer();
		await appContainer.init();

		httpPort = await portfinder.getPortPromise();

		app = appContainer.createZbApplication([{
			include: [
				{
					modules: ['custom-compilation-files/lib.js'],
					static: {'/custom-web-path/data.json': 'static/data.json'},
					aliases: {'custom-alias': 'custom-compilation-files'}
				}
			],
			devServer: {
				backdoor: 'dev.js',
				port: httpPort,
				enableRawProxy: true,
				proxy: {
					'/proxy-custom': `http://localhost:${httpPort}/custom-web-path`
				}
			}
		}], [
			path.join(__dirname, '..', 'fixtures', 'zombiebox-platform-tamagotchi'),
			path.join(__dirname, '..', 'fixtures', 'zombiebox-extension-blockchain')
		]);

		await app.ready();
		await app.serve();
	});

	after(async () => {
		await appContainer.cleanup();
	});

	it('Should serve a html page', async () => {
		const rootResponse = await got(`http://localhost:${httpPort}`);
		expect(rootResponse.headers['content-type']).equal('text/html; charset=UTF-8');

		const indexHtmlResponse = await got(`http://localhost:${httpPort}/index.html`);
		expect(indexHtmlResponse.headers['content-type']).equal('text/html; charset=UTF-8');
	});

	it('Should serve js files', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/zb-test/application.js`);

		expect(response.headers['content-type']).equal('application/javascript; charset=UTF-8');
		expect(response.body, '/modules/zb-test/application.js response did not match reference');
	});

	it('Should serve css files', async () => {
		const response = await got(`http://localhost:${httpPort}/styles/zb-test/application.css`);

		expect(response.headers['content-type']).equal('text/css; charset=UTF-8');
		expect(response.body, '/zb-test/application.css response did not match reference')
			.equal(readFileFromApplicationFixtures('src/application.css'));
	});

	it('Should serve framework files', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/zb/abstract-application.js`);

		expect(response.body, '/modules/zb/abstract-application.js response did not match reference')
			.equal(replaceAliasedPaths(readFileFromFramework('abstract-application.js')));
	});

	it('Should serve extension files', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/blockchain/service.js`);

		expect(response.body, '/modules/blockchain/service.js response did not match reference')
			.equal(replaceAliasedPaths(readFileFromAddonFixtures('zombiebox-extension-blockchain/lib/service.js')));
	});

	it('Should serve platform files', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/tamagotchi/device.js`);

		expect(response.body, '/modules/tamagotchi/device.js response did not match reference')
			.equal(replaceAliasedPaths(readFileFromAddonFixtures('zombiebox-platform-tamagotchi/lib/device.js')));
	});

	it('Should serve development backdoor', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/backdoor`);

		expect(response.body, '/modules/backdoor response did not match reference')
			.equal(readFileFromApplicationFixtures('dev.js'));
	});

	it('Should serve custom compilation files', async () => {
		const response = await got(`http://localhost:${httpPort}/modules/custom-alias/lib.js`);

		expect(response.body).equal(readFileFromApplicationFixtures('custom-compilation-files/lib.js'));
	});

	it('Should serve custom static files', async () => {
		const response = await got(`http://localhost:${httpPort}/custom-web-path/data.json`);

		expect(response.body, '/custom-web-path/data.json response did not match reference')
			.equal(readFileFromApplicationFixtures('static/data.json'));
	});

	it('Should proxy by a map', async () => {
		const response = await got(`http://localhost:${httpPort}/proxy-custom/data.json`);

		expect(response.body, '/proxy-custom/data.json response did not match reference')
			.equal(readFileFromApplicationFixtures('static/data.json'));
	});

	it('Should proxy raw', async () => {
		const url = `http://localhost:${httpPort}/proxy/data.json?url=http://localhost:${httpPort}/custom-web-path`;
		const response = await got(url);

		expect(response.body, 'Response did not match reference')
			.equal(readFileFromApplicationFixtures('static/data.json'));
	});
});

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileFromApplicationFixtures(filePath) {
	return fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'application', filePath), 'utf-8');
}

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileFromAddonFixtures(filePath) {
	return fs.readFileSync(path.join(__dirname, '..', 'fixtures', filePath), 'utf-8');
}

/**
 * @param {string} filePath
 * @return {string}
 */
function readFileFromFramework(filePath) {
	return fs.readFileSync(path.join(__dirname, '..', '..', '..', 'zb', filePath), 'utf-8');
}
