var rabbitmq = require('../connectors/rabbitmq');
var parseToString = require('haru-nodejs-util').common.parseToString;
var deepCopy = require('haru-nodejs-util').common.deepCopy;

exports.createEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg) );
	// });
	var msg = deepCopy( input );

	msg.method = 'create';

	msg.entity = parseToString(input.entity);

	rabbitmq.publish('write', msg, callback);
};

exports.updateEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	var msg = deepCopy( input );
	
	msg.entity = parseToString(input.entity);

	rabbitmq.publish('write', input, callback);
};

exports.deleteEntity = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	rabbitmq.publish('write', input, callback);
};
