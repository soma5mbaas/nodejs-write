var rabbitmq = require('../connectors/rabbitmq');
var parseToString = require('haru-nodejs-util').common.parseToString;
var deepCopy = require('haru-nodejs-util').common.deepCopy;

/**
 * TODO
 * worker 수정되면 parsing 하지 않게 수정
 * **/
exports.createEntity = function(input, callback) {
    // redis 저장을 위해 entity value들을 String으로 parsing
	var msg = deepCopy( input );
//	msg.entity = parseToString(input.entity);
    

	rabbitmq.publish('write', msg, callback);
};

exports.updateEntity = function(input, callback) {
	var msg = deepCopy( input );
//	msg.entity = parseToString(input.entity);

	rabbitmq.publish('write', msg, callback);
};

exports.deleteEntity = function(input, callback) {
	rabbitmq.publish('write', input, callback);
};
