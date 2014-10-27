/**
 * Created by syntaxfish on 14. 10. 27..
 */

var async = require('async');
var store = require('haru-nodejs-store');
var keys = require('haru-nodejs-util').keys;



exports.create = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    async.series([
        function exitsClass(callback) {
            store.get('public').sismember(keys.classesKey(applicationId), className,function(error, results) {
                if( error ) { return callback(error, results); }
                if( Boolean(results) ) { return callback(errorCode.INVALID_CLASS_NAME, results); }

                callback(error, results);
            });
        },
        function addClassRedis(callback) {
            store.get('public').sadd(keys.classesKey(applicationId), className, callback);
        },
        function createClassMongo(callback) {
            store.get('mongodb').createCollection(keys.collectionKey(className, applicationId), callback);
        },
        function addShardingKey(callback) {
            store.get('mongodb').addShardCollection(keys.collectionKey(className, applicationId));

            callback(null, null);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};