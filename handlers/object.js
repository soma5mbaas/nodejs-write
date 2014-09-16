var rabbitmq = require('../connectors/rabbitmq');
var util = require('../utils/util');
var deepCopy = require('../utils/util').deepCopy;

exports.createObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg) );
	// });
	var msg = deepCopy( input );

	msg.method = 'create';
	msg.object = util.parseToString(input.object);

	rabbitmq.publish('write', msg, callback);
};

exports.updateObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	var msg = deepCopy( input );
	
	msg.method = 'update';
	msg.object = util.parseToString(input.object);

	rabbitmq.publish('write', input, callback);
};

exports.deleteObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });
	input.method = 'delete';

	rabbitmq.publish('write', input, callback);
};
