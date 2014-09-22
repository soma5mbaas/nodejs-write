var rabbitmq = require('../connectors/rabbitmq');
var util = require('../utils/util');
var deepCopy = require('../utils/util').deepCopy;

exports.createEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg) );
	// });
	var msg = deepCopy( input );

	msg.method = 'create';
	msg.entity = util.parseToString(input.entity);

	rabbitmq.publish('write', msg, callback);
};

exports.updateEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	var msg = deepCopy( input );
	
	msg.method = 'update';
	msg.entity = util.parseToString(input.entity);

	rabbitmq.publish('write', input, callback);
};

exports.deleteEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });
	input.method = 'delete';

	rabbitmq.publish('write', input, callback);
};
