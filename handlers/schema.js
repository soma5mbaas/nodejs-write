var rabbitmq = require('../connectors/rabbitmq');
var exportSchema = require('haru-nodejs-util').common.exportSchema;

exports.createSchema = function(input, callback) {
	var json = {
		schema: exportSchema( input.entity ),
		applicationId: input.applicationId,
		class: input.class,
		method: 'create'
	};

	rabbitmq.publish('schema', json, callback);
};

exports.updateSchema = function(input, callback) {
	var json = {
		schema: exportSchema( input.entity ),
		applicationId: input.applicationId,
		class: input.class,
		method: 'update'
	};

	rabbitmq.publish('schema', json, callback);
};
