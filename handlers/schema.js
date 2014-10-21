
var exportSchema = require('haru-nodejs-util').common.exportSchema;
var exportSchemaToJson = require('haru-nodejs-util').common.exportSchemaToJson;

var EntitySchema = require('haru-nodejs-util').models.Entity.schema;
var InstallationSchema = require('haru-nodejs-util').models.Installation.schema;
var UserSchema = require('haru-nodejs-util').models.User.schema;
var keys = require('haru-nodejs-util').keys;


var store = require('haru-nodejs-store');


exports.createSchema = function(input, callback) {
    var schema = exportSchemaToJson(input.entity, EntitySchema);
    var schemaKey = keys.schemaKey(input.applicationId, input.class);

    store.get('service').hmset(schemaKey, schema);
};

exports.updateSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);
    var schema = exportSchemaToJson(input.entity);

    store.get('service').hmsetnx(schemaKey, schema, callback);
};

exports.deleteSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);

    store.get('service').del(schemaKey, callback);
};

exports.deleteColumnSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);

    store.get('service').hdel(schemaKey, input.column, callback);
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
