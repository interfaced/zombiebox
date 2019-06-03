// This application does not actually use webpack
// This config only exists to define module aliases for development tools such as WebStorm
// It is generated automatically with "zb generateAliases"

const aliases = <%= JSON.stringify(map, null, '\t') %>;

module.exports = {
	resolve: {
		alias: aliases
	}
};
