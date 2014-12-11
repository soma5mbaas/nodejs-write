
var exportSchema = require('haru-nodejs-util').common.exportSchema;
var exportSchemaToJson = require('haru-nodejs-util').common.exportSchemaToJson;

var Schema = {
    Entity: require('haru-nodejs-util').models.Entity.schema,
    Installations: require('haru-nodejs-util').models.Installation.schema,
    Users: require('haru-nodejs-util').models.User.schema
};

var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');


exports.createSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);
    var schema = exportSchemaToJson(input.entity, _getSchemaModel(input.class) );

    store.get('public').hmset(schemaKey, schema, callback);
};

exports.updateSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);
    var schema = exportSchemaToJson(input.entity, _getSchemaModel(input.class) );

    store.get('public').hmsetnx(schemaKey, schema, callback);
};

exports.deleteSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);

    store.get('public').del(schemaKey, callback);
};

exports.deleteColumnSchema = function(input, callback) {
    var schemaKey = keys.schemaKey(input.applicationId, input.class);

    store.get('public').hdel(schemaKey, input.column, callback);
};

function _getSchemaModel(className) {
    return Schema[className] === undefined ? Schema['Entity'] :  Schema[className];
}
