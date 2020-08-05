/*
 * This file is part of the ZombieBox package.
 *
 * Copyright © 2012-2020, Interfaced
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const fse = require('fs-extra');
const http = require('http');
const {URL} = require('url');
const kleur = require('kleur');
const espree = require('espree');
const connect = require('connect');
const send = require('send');
const httpProxy = require('http-proxy');
const morgan = require('morgan');
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');
const postcssValuesParser = require('postcss-values-parser');
const serveStatic = require('serve-static');
const zbLogServer = require('zb-log-server');
const Application = require('./application');
const PathHelper = require('./path-helper');
const ServerCache = require('./server-cache');
const logger = require('./logger').createChild('Server');


/**
 */
class Server {
	/**
	 * @param {Application} application
	 */
	constructor(application) {
		/**
		 * @type {Application}
		 * @protected
		 */
		this._application = application;

		/**
		 * @type {Function}
		 * @protected
		 */
		this._app = connect();

		/**
		 * @type {Object}
		 * @protected
		 */
		this._proxyServer = httpProxy.createProxyServer();

		/**
		 * @type {?http.Server}
		 * @protected
		 */
		this._httpServer = null;

		/**
		 * @type {?number}
		 * @protected
		 */
		this._httpPort = null;

		/**
		 * @type {postcss.Processor}
		 * @protected
		 */
		this._postcss;

		/**
		 * @type {ServerCache}
		 * @protected
		 */
		this._stylesCache = new ServerCache((content, path) => this._preprocessStyle(content, path));

		/**
		 * @type {ServerCache}
		 * @protected
		 */
		this._modulesCache = new ServerCache((content, path) => this._preprocessModule(content, path));

		const postcssConfig = this._application.getConfig().postcss;
		this._postcss = postcss([
			postcssPresetEnv({...postcssConfig.presetEnv}),
			...postcssConfig.filePlugins,
			postcss.plugin('resolve-imports', () => (root) => {
				root.walkAtRules('import', (rule) => {
					let node = postcssValuesParser.parse(rule.params).nodes[0];
					if (node.type === 'func' && node.name === 'url') {
						node = node.nodes[0];
					}
					if (node.type !== 'quoted') {
						return;
					}
					const importPath = node.value.substring(1, node.value.length - 1);

					if (PathHelper.isLocal(importPath)) {
						return;
					}

					const fsPath = this._application.aliasedPathToFsPath(importPath);
					const webPath = this.getStyleWebPath(fsPath);
					const modifiedValue = rule.params.replace(importPath, webPath);

					// eslint-disable-next-line new-cap
					rule.replaceWith(new postcss.atRule({name: 'import', params: modifiedValue}));
					logger.silly(`Replacing CSS import ${importPath} with ${webPath}`);
				});
			})
		]);

		this._app.use(morgan('dev', {skip: (req, res) => res.statusCode < 400}));

		this._initEndpointMiddleware();
		this._initModulesMiddleware();
		this._initStylesMiddleware();
		this._initErrorMiddleware();
	}

	/**
	 * @param {string|Function} route or middleware
	 * @param {Function=} middleware
	 * @return {connect}
	 */
	use(route, middleware) {
		return this._app.use(route, middleware);
	}

	/**
	 * @param {string} alias
	 * @param {string} dir
	 */
	serveStatic(alias, dir) {
		this.use(alias, serveStatic(dir));
	}

	/**
	 * @param {string} route
	 */
	rawProxy(route) {
		logger.info(`Proxy enabled at ${kleur.cyan(route + '/?url=...')}`);
		this.use(route, (req, res) => {
			// see https://github.com/nodejs/node/issues/12682
			const address = (new URL(req.url, 'request-target://')).searchParams.get('url');
			this._proxyServer.web(req, res, {
				target: address
			});
		});
	}

	/**
	 * @param {string} route
	 * @param {string} address
	 */
	proxy(route, address) {
		logger.info(`Proxying path ${kleur.green(route)} from ${kleur.cyan(address)}`);
		this.use(route, (req, res) => {
			req.headers.host = (new URL(address)).host;
			this._proxyServer.web(req, res, {
				target: address
			});
		});
	}

	/**
	 * @param {string} route
	 */
	logServer(route) {
		logger.verbose(`Log server started at ${route}`);
		this.use(route, zbLogServer);
	}

	/**
	 * @param {number=} port
	 * @return {Promise<string>}
	 */
	start(port = Server.DEFAULT_PORT) {
		this._httpPort = port;
		this._httpServer = http.createServer(this._app);

		return new Promise((resolve, reject) => {
			this._httpServer.listen(this._httpPort);

			this._httpServer.on('error', (e) => {
				if (e.code === 'EADDRINUSE') {
					e.message = (
						`Port ${this._httpPort} is already used by another process. ` +
						`Tip: to find this process use command like: \`lsof -i:${this._httpPort}\``
					);
				}

				reject(e);
			});

			this._httpServer.on('listening', () => {
				resolve(this._getAddress());
			});
		});
	}

	/**
	 * @param {string} fsPath
	 * @return {string}
	 */
	getModuleWebPath(fsPath) {
		return '/modules/' + this._application.fsPathToAliasedPath(fsPath);
	}

	/**
	 * @param {string} fsPath
	 * @return {string}
	 */
	getStyleWebPath(fsPath) {
		return '/styles/' + this._application.fsPathToAliasedPath(fsPath);
	}

	/**
	 * @return {string}
	 * @protected
	 */
	_getAddress() {
		return `http://localhost${this._httpPort === 80 ? '' : ':' + this._httpPort}/`;
	}

	/**
	 * @param {http.ServerResponse} res
	 * @param {Object} indexHTMLOptions
	 * @protected
	 */
	async _respondIndexHTMLPage(res, indexHTMLOptions) {
		logger.info(`Rendering application`);
		const {backdoor} = this._application.getConfig().devServer;

		if (backdoor && await fse.pathExists(backdoor)) {
			const entryPoint = this.getModuleWebPath(this._application.getGeneratedEntryPoint()).replace(/\.js$/, '');

			logger.info(`Development backdoor plugged in`);

			indexHTMLOptions.modules.splice(
				indexHTMLOptions.modules.indexOf(entryPoint),
				0,
				this.getModuleWebPath(backdoor)
			);
		}

		res.setHeader('Content-Type', 'text/html; charset=UTF-8');
		res.end(this._application.getIndexHTMLContent(
			indexHTMLOptions,
			this._application.getPlatforms().find((platform) => platform.getName() === 'pc')
		));
	}

	/**
	 * @protected
	 */
	_initEndpointMiddleware() {
		const entryPoint = this.getModuleWebPath(this._application.getGeneratedEntryPoint()).replace(/\.js$/, '');
		const config = this._application.getConfig();

		this._app.use(async (req, res, next) => {
			const {pathname} = new URL(req.url, 'request-target://');

			switch (pathname) {
				case '/':
				case '/index.html':
					let styles = [];
					if (config.postcss.importEntryPoints) {
						styles = config.postcss.importEntryPoints;
					} else {
						styles = this._application.getSortedStyles();
					}

					styles = styles.map((fsPath) => this.getStyleWebPath(fsPath));

					await this._respondIndexHTMLPage(res, {
						modules: [entryPoint],
						styles
					});
					break;

				// For backward compatibility
				case '/es5':
				case '/es5.html':
				case '/es6':
				case '/es6/':
				case '/es6.html':
				case '/bundle.html':
					logger.warn(`Obsolete entry point: ${pathname}`);
					res.writeHead(301, {'Location': '/'});
					res.end();
					break;

				default:
					next();
			}
		});
	}

	/**
	 * @param {string} content
	 * @param {string} fsPath
	 * @return {string}
	 * @protected
	 */
	_preprocessModule(content, fsPath) {
		let ast;

		try {
			ast = espree.parse(content, {
				sourceType: 'module',
				ecmaVersion: 2019
			});
		} catch (e) {
			logger.error(`Error while resolving module paths in ${kleur.underline(fsPath)}: ${e.toString()}`);
			logger.debug(e.stack);
		}

		if (!ast) {
			return content;
		}

		let patchedContent = content;
		for (const node of ast.body.reverse()) {
			// Imports can only be at top level as per specification
			if (node.type === 'ImportDeclaration') {
				const source = node.source;
				if (source.type === 'Literal' && !PathHelper.isLocal(source.value)) {
					const webPath = '/modules/' + source.value;
					const replacement = source.raw.replace(source.value, webPath);

					// logger.silly(
					// 	`Replacing import path ${kleur.red(source.value)} ` +
					// 	`with ${kleur.green(webPath)} in ` +
					// 	kleur.underline(fsPath)
					// );

					patchedContent =
						patchedContent.slice(0, source.start) +
						replacement +
						patchedContent.slice(source.end);
				}
			}
		}
		return patchedContent;
	}

	/**
	 * @protected
	 */
	_initModulesMiddleware() {
		this._app.use('/modules', (req, res, next) => {
			// Serve js modules
			const aliasedPath = req.url.substr('/'.length);
			let fsPath = this._application.aliasedPathToFsPath(aliasedPath);

			if (!fsPath) {
				next(new Error(`Can't resolve aliased module path ${kleur.bold(aliasedPath)}`));
				return;
			}

			if (!fsPath.endsWith('.js')) {
				fsPath += '.js';
			}

			this._modulesCache.get(fsPath)
				.then((content) => {
					res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
					res.end(content);
				});
		});
	}

	/**
	 * @param {string} content
	 * @param {string} fsPath
	 * @return {string}
	 * @protected
	 */
	_preprocessStyle(content, fsPath) {
		const pluginNames = this._postcss.plugins.map((plugin) => plugin && plugin.postcssPlugin).join(', ');
		logger.silly(`Running ${kleur.cyan(pluginNames)} on ${kleur.underline(fsPath)}`);

		return this._postcss.process(content, {from: fsPath})
			.then((result) => result.css);
	}

	/**
	 * @protected
	 */
	_initStylesMiddleware() {
		/**
		 * @param {string} str
		 * @return {number}
		 */
		function lengthInUtf8Bytes(str) {
			// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
			const m = encodeURIComponent(str).match(/%[89ABab]/g);

			return str.length + (m ? m.length : 0);
		}

		this._app.use('/styles', (req, res, next) => {
			const aliasedPath = req.url.substr('/'.length);
			const fsPath = this._application.aliasedPathToFsPath(aliasedPath);

			if (!fsPath) {
				next(new Error(`Can't resolve aliased css file path ${kleur.bold(aliasedPath)}`));
				return;
			}

			if (fsPath.endsWith('.css')) {
				try {
					res.setHeader('Content-Type', 'text/css; charset=UTF-8');

					this._stylesCache.get(fsPath)
						.then((styleContent) => {
							res.setHeader('Content-Length', lengthInUtf8Bytes(styleContent));
							res.end(styleContent);
						});
				} catch (err) {
					next(err);
				}
			} else {
				send(req, fsPath).pipe(res);
			}
		});
	}

	/**
	 * @protected
	 */
	_initErrorMiddleware() {
		this._app.use((error, req, res, next) => {
			let message = error.message;

			if (req.headers.referer) {
				const referer = req.headers.referer.split(this._getAddress()).pop();
				if (referer) {
					message += `\n\tReferrer: ${kleur.underline(referer)}`;
				}
			}
			logger.error(message);
			next();
		});
	}
}


/**
 * @const {number}
 */
Server.DEFAULT_PORT = 80;


module.exports = Server;
