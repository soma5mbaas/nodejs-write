var rabbitmq = require('../connectors/rabbitmq');
var parseToString = require('haru-nodejs-util').common.parseToString;
var deepCopy = require('haru-nodejs-util').common.deepCopy;

/**
 * TODO
 * worker 수정되면 parsing 하지 않게 수정
 * **/
exports.createEntity = function(input, callback) {
	rabbitmq.publish('write', input, callback);
};

exports.updateEntity = function(input, callback) {
	var msg = deepCopy( input );
	rabbitmq.publish('write', input, callback);
};

exports.deleteEntity = function(input, callback) {
	rabbitmq.publish('write', input, callback);
};

exports.deleteClass = function(input, callback) {
    rabbitmq.publish('write', input, callback);
};

exports.deleteField = function(input, callback) {
    rabbitmq.publish('write', input, callback);
};