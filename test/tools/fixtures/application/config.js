const path = require('path')

/**
 * @return {IZombieBoxConfig}
 */
module.exports = () => ({
	project: {
		name: 'zb-test',
		entry: 'src/application.js',
		src: 'src'
	},
	devServer: {
		port: 7777
	}
});
