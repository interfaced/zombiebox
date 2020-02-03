const winston = require('winston');


const levels = {
	output: 0,
	error: 1,
	warn: 2,
	info: 3,
	verbose: 4,
	debug: 5,
	silly: 6
};

winston.addColors({
	output: 'bold'
});

const colorizeFormat = winston.format.colorize();


/* eslint-disable interfaced/no-param-reassign */

const rootLogger = winston.createLogger({
	levels,
	level: 'warn', // Default level used when zombiebox is used programmarically, CLI will override it
	transports: [
		new winston.transports.Console({
			format: winston.format.printf((info) => {
				if (['output', 'error', 'warn'].includes(info.level)) {
					info = colorizeFormat.transform(info, {message: true});
				}

				if (['output', 'error', 'warn', 'info'].includes(rootLogger.level)) {
					return info.message;
				}

				info.level = (info.level + ':' + info.label);
				info = colorizeFormat.transform(info, {level: true});

				const level = ('[' + info.level + ']');

				return `${level} ${info.message}`;
			})
		})
	]
});


const createChild = (label) => rootLogger.child({label});

module.exports = {
	rootLogger,
	levels,
	createChild
};
