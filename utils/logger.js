var winston = require('winston');
var loggerConfig = require('../config').logger.config;

module.exports = function( logFilename ) {
	var logger = new winston.Logger({
		levels: loggerConfig.levels,
		transports:[ 
			new winston.transports.Console(loggerConfig.console),
			new winston.transports.File({
		        level      : config.loglevel,
		        json       : false,
		        filename   : logFilename
	      	})
		],
		colors: loggerConfig.colors,
		exitOnError: loggerConfig.exitOnError
	});

	// winston.addColors( loggerConfig.colors );
	// logger.exitOnError = loggerConfig.exitOnError;

	return logger;
};