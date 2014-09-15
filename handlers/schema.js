var rabbitmq = require('../connectors/rabbitmq');
var keys = require('../utils/keys');

exports.createSchema = function(applicationId, className, schema, callback) {
	var json = {
		schema: schema,
		applicationId: applicationId,
		class: className,
		method: 'create'
	};

	rabbitmq.publish('schema', json, callback);
};

exports.updateSchema = function(applicationId, className, schema, callback) {
	var json = {
		schema: schema,
		applicationId: applicationId,
		class: className,
		method: 'update'
	};

	rabbitmq.publish('schema', json, callback);
};
