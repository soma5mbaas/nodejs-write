var rabbitmq = require('../connectors/rabbitmq');
var keys = require('../utils/keys');

exports.createSchema = function(input, callback) {
	var json = {
		schema: Object.keys(input.object),
		applicationId: input.applicationId,
		class: input.class,
		method: 'create'
	};

	rabbitmq.publish('schema', json, callback);
};

exports.updateSchema = function(input, callback) {
	var json = {
		schema: Object.keys(input.object),
		applicationId: input.applicationId,
		class: input.class,
		method: 'update'
	};

	rabbitmq.publish('schema', json, callback);
};
