var rabbitmq = require('../connectors/rabbitmq');
var util = require('../utils/util');

exports.createObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg) );
	// });

	input.method = 'create';
	input.object = util.parseToString(input.object);

	rabbitmq.publish('write', input, callback);
};

exports.updateObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });
	input.method = 'update';
	input.object = util.parseToString(input.object);

	rabbitmq.publish('write', input, callback);
};

exports.deleteObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });
	input.method = 'delete';

	rabbitmq.publish('write', input, callback);
};
