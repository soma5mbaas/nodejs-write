var rabbitmq = require('../connectors/rabbitmq');

var exportSchema = require('haru-nodejs-util').common.exportSchema;

var EntitySchema = require('../models').Entity.schema;
var InstallationSchema = require('../models').Installaion.schema;
var UserSchema = require('../models').User.schema;


exports.createSchema = function(input, callback) {
	var json = {
		schema: exportSchema( input.entity, EntitySchema ),
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


exports.createInstallationSchema = function(input, callback) {
    var json = {
        schema: exportSchema( input.entity ,InstallationSchema),
        applicationId: input.applicationId,
        class: input.class,
        method: 'create'
    };
    
    rabbitmq.publish('schema', json, callback);
};

exports.updateInstallationSchema = function(input, callback) {
    var json = {
        schema: exportSchema( input.entity ),
        applicationId: input.applicationId,
        class: input.class,
        method: 'update'
    };


    rabbitmq.publish('schema', json, callback);
};

exports.createUserSchema = function(input, callback) {
    var json = {
        schema: exportSchema( input.entity, UserSchema ),
        applicationId: input.applicationId,
        class: input.class,
        method: 'create'
    };
    

    rabbitmq.publish('schema', json, callback);
};

exports.updateUserSchema = function(input, callback) {
    var json = {
        schema: exportSchema( input.entity ),
        applicationId: input.applicationId,
        class: input.class,
        method: 'update'
    };

    rabbitmq.publish('schema', json, callback);
};

exports.deleteSchema = function(input, callback) {
    var json = {
        applicationId: input.applicationId,
        class: input.class,
        method: 'delete'
    };

    rabbitmq.publish('schema', json, callback);
};