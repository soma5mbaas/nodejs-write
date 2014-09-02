var winston = require('winston');
var loggerConfig = require('../config').logger.config;

module.exports = function( logFilename ) {
	var consoleConfig = config.logger.console;
	var fileConfig = config.logger.file;

	fileConfig.filename = logFilename;

	var logger = new winston.Logger({
		levels: loggerConfig.levels,
		transports:[ 
			new winston.transports.Console(consoleConfig),
			new winston.transports.File(fileConfig)
		],
		exitOnError: loggerConfig.exitOnError
	});

	winston.addColors(loggerConfig.colors);

	return logger;
};