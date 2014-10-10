var rabbitmq = require('../connectors/rabbitmq');
var exportSchema = require('haru-nodejs-util').common.exportSchema;

var InstallationSchema = require('../models').Installaion.schema;
var UserSchema = require('../models').User.schema;


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


// TODO installation 에 property가 추가되면 schema 에 추가하는 기능 추가
exports.createInstallationSchema = function(input, callback) {
    var json = {
        schema: InstallationSchema,
        applicationId: input.applicationId,
        calss: input.class,
        method: 'create'
    };
    
    rabbitmq.publish('schema', json, callback);
};

// TODO installation 에 property가 추가되면 schema 에 추가하는 기능 추가
exports.updateInstallationSchema = function(input, callback) {
    var json = {
        schema: exportSchema( input.entity ),
        applicationId: input.applicationId,
        class: input.class,
        method: 'update'
    };


    rabbitmq.publish('schema', json, callback);
};

// TODO user 에 property가 추가되면 schema 에 추가하는 기능 추가
exports.createUserSchema = function(input, callback) {
    var json = {
        schema: UserSchema,
        applicationId: input.applicationId,
        calss: input.class,
        method: 'create'
    };

    rabbitmq.publish('schema', json, callback);
};

// TODO user 에 property가 추가되면 schema 에 추가하는 기능 추가
exports.updateUserSchema = function(input, callback) {
    var json = {
        schema: UserSchema,
        applicationId: input.applicationId,
        calss: input.class,
        method: 'update'
    };

    rabbitmq.publish('schema', json, callback);
};