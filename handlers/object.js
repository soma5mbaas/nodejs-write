var rabbitmq = require('../connectors/rabbitmq');

exports.createObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg) );
	// });

	rabbitmq.publish('write', input);
	callback( null, null );


};

exports.updateObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	rabbitmq.publish('write', input);
	callback( null, null );
};

exports.deleteObject = function(input, callback) {
	// rabbitmq.rpc('write', input, function(msg) {
	// 	callback( null, JSON.parse(msg));
	// });

	rabbitmq.publish('write', input);
	callback( null, null );
};
