const {expect} = require('chai');

const gcc = require('../mock-google-closure-compiler');
const TemporaryApplicationContainer = require('../temporary-application-container');


describe('Building', () => {
	let appContainer;

	before(() => {
		gcc.mock();
	});

	beforeEach(async () => {
		appContainer = new TemporaryApplicationContainer();
		await appContainer.init();
	});

	afterEach(async () => {
		await appContainer.cleanup();
		gcc.spy.resetHistory();
	});

	describe('Scripts compressing', () => {
		it('Should pass the default flags to the compiler', async () => {
			const app = appContainer.createZbApplication([]);
			await app.ready();
			await app.getBuildHelper().getCompressedScripts();

			expect(gcc.spy.called).be.true;

			const args = gcc.spy.args[0][0];

			expect(args['compilation_level']).equal('ADVANCED_OPTIMIZATIONS');
			expect(args['language_out']).equal('ES5');
			expect(args['warning_level']).equal('VERBOSE');
			expect(args['charset']).equal('UTF8');
			expect(args['module_resolution']).equal('BROWSER_WITH_TRANSFORMED_PREFIXES');
			expect(args['browser_resolver_prefix_replacements']).to.be.an('array').that.is.not.empty;
			expect(args['dependency_mode']).equal('PRUNE');
			expect(args['entry_point']).to.be.a('string');
			expect(args['summary_detail_level']).equal('3');
			expect(args['externs']).to.be.an('array').that.has.length(1); // hls.js
			expect(args['js']).to.be.an('array').that.is.not.empty;
		});

		it('Should apply flags from the arguments', async () => {
			const app = appContainer.createZbApplication([]);
			await app.ready();
			await app.getBuildHelper().getCompressedScripts({'compilation_level': 'SIMPLE'});

			expect(gcc.spy.called).be.true;
			expect(gcc.spy.args[0][0]['compilation_level']).to.equal('SIMPLE');
		});

		it('Should compile the application code', async () => {
			const app = appContainer.createZbApplication([]);
			await app.ready();
			await app.getBuildHelper().getCompressedScripts();

			expect(gcc.spy.called).be.true;

			expect(gcc.spy.args[0][0]['js']).include(appContainer.getFilePath('.generated/base-application.js'));
			expect(gcc.spy.args[0][0]['js']).include(appContainer.getFilePath('src/application.js'));
		});

		it('Should be configurable', async () => {
			const app = appContainer.createZbApplication([{
				include: [
					{
						modules: ['vendor/lodash.js'],
						externs: ['vendor/lodash.js']
					},
					{
						// This file does not exist and is expected to be filtered out
						modules: ['vendor/jquery.js']
					}
				],
				gcc: {
					'compilation_level': 'SIMPLE_OPTIMIZATIONS'
				}
			}]);

			await app.ready();
			await app.getBuildHelper().getCompressedScripts();

			expect(gcc.spy.called).be.true;

			expect(gcc.spy.args[0][0]['compilation_level']).equal('SIMPLE_OPTIMIZATIONS');
			expect(gcc.spy.args[0][0]['externs']).to.include(appContainer.getFilePath('vendor/lodash.js'));

			expect(gcc.spy.args[0][0]['js']).include(appContainer.getFilePath('vendor/lodash.js'));
			expect(gcc.spy.args[0][0]['js']).not.include(appContainer.getFilePath('vendor/jquery.js'));
		});
	});

	describe('Styles compressing', () => {
		it('Should include the application styles', async () => {
			const app = appContainer.createZbApplication([]);
			await app.ready();
			const {css} = await app.getBuildHelper().getCompressedStyles('dist');

			expect(css).include('.my');
		});

		it('Should inline resources', async () => {
			const app = appContainer.createZbApplication([{
				postcss: {
					url: {
						url: 'inline'
					}
				}
			}]);
			await app.ready();
			const {css} = await app.getBuildHelper().getCompressedStyles('dist');

			const backgroundContent = await appContainer.readFile('src/background.png', null);
			expect(css).include(
				`data:image/png;base64,${backgroundContent.toString('base64')}`
			);
		});

		it('Should not inline resources', async () => {
			const app = appContainer.createZbApplication([{
				postcss: {
					url: {
						url: 'copy'
					}
				}
			}]);
			await app.ready();
			const {css} = await app.getBuildHelper().getCompressedStyles('dist');

			const backgroundContent = await appContainer.readFile('src/background.png', null);
			expect(css).include('url(styles/67d039f.png)');
			expect(css).not.include(`data:image/png;base64,${backgroundContent.toString('base64')}`);
			expect(await appContainer.readFile('dist/styles/67d039f.png', null))
				.to.deep.equal(backgroundContent);
		});

		it('Should be configurable', async () => {
			const app = appContainer.createZbApplication([{
				include: [
					{
						css: ['vendor/lodash.css']
					},
					{
						// This file does not exist and is expected to be filtered out
						css: ['vendor/jquery.css']
					}
				]
			}]);
			await app.ready();
			const {css} = await app.getBuildHelper().getCompressedStyles('dist');

			expect(css).to.include('.lodash');
			expect(css).not.include('.jquery');
		});
	});

	describe('Static files files handling', () => {
		it('Should copy static files', async () => {
			const app = appContainer.createZbApplication([{
				include: [
					{
						static: {
							'/custom-static-path/data.json': 'static/data.json'
						}
					}
				]
			}]);

			await app.ready();
			await app.getBuildHelper().copyStaticFiles('dist');

			expect(await appContainer.readFile('dist/custom-static-path/data.json'), 'utf-8')
				.equal(await appContainer.readFile('static/data.json'), 'utf-8');
		});
	});
});
