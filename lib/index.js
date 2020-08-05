/* eslint-disable node/global-require */

module.exports = {
	Application: require('./application'),
	AbstractAddon: require('./addons/abstract-addon'),
	AbstractPlatform: require('./addons/abstract-platform'),
	AbstractExtension: require('./addons/abstract-extension'),
	ISourceProvider: require('./sources/i-source-provider'),
	TemplateHelper: require('./template-helper'),
	utils: require('./utils'),
	logger: require('./logger')
};
