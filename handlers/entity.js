var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var getShardKey = require('haru-nodejs-util').common.getShardKey;
var createEntityId = require('haru-nodejs-util').common.createEntityId;

var _ = require('underscore');
var async = require('async');
const QueryLimit = 5000;


/**
 * TODO
 * worker 수정되면 parsing 하지 않게 수정
 * **/
exports.createEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var entity = input.entity;

    var options = {};

    async.series([
        function createId(callback) {
            createEntityId({ timestamp:input.timestamp, public: store.get('public') }, function(error, id, shardKey) {
                input._id = entity._id = id;
                input.shardKey = shardKey;

                callback(error);
            });
        },
        function addMetaDataToPublic(callback) {
            store.get('public').multi()
                .sadd(keys.classesKey(applicationId), className)
                .zadd(keys.entityKey(className, applicationId), input.timestamp, input._id)
                .exec(function(error, results) {
                    options.isNewClass = results[0] === 1;
                    callback(error);
                });
        },
        function addShardCollection(callback) {
            if( options.isNewClass ) {
                store.get('mongodb').addShardCollection(keys.collectionKey(className, applicationId));
            }

            callback(null);
        },
        function addEntityToMongo(callback) {
            store.get('mongodb').insert(keys.collectionKey(className, applicationId), entity, callback);
        },
        function addEntityToRedis(callback) {
            store.get('service').hmset(keys.entityDetail(className, input._id, applicationId), entity, callback, input.shardKey);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.updateEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var entity = input.entity;
    var shardKey = getShardKey(input._id);

    async.series([
        function isExistEntity(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }

                callback(error, results);
            }, shardKey);
        },
        function updateEntityToMongoDB(callback){
            store.get('mongodb').update(keys.collectionKey(className, applicationId),{_id: input._id}, {$set: entity}, callback);
        },
        function updateEntityToRedis(callback){
            store.get('service').hmset(keys.entityDetail(className, input._id, applicationId), entity, callback, shardKey);
        },
        function updateEntityIdToPublic(callback) {
            store.get('public').zadd(keys.entityKey(className, applicationId), input.timestamp, input._id, callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.deleteEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var shardKey = getShardKey(input._id);

    async.series([
        function isExistEntity(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }
                callback(error, results);
            }, shardKey);
        },
        function deleteEntityToMongoDB(callback){
            store.get('mongodb').remove(keys.collectionKey(className, applicationId),{_id: input._id}, callback);
        },
        function deleteEntityToRedis(callback){
            store.get('service').del(keys.entityDetail(className, input._id, applicationId), callback, shardKey);
        },
        function deleteEntityToRedis(callback) {
            store.get('public').zrem(keys.entityKey(className, applicationId), input._id, callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.deleteClass = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    async.series([
        function isExistClass(callback) {
            store.get('public').sismember(keys.classesKey(applicationId), className, function(error, result){
                if( result === 0) {
                    return callback( errorCode.INVALID_CLASS_NAME, null );
                }

                callback(null, null);
            });
        },
        function deleteMongoDB(callback){
            store.get('mongodb').drop(keys.collectionKey(className, applicationId), callback);
        },
        function deleteRedisEntity(callback){
            (function deleteEntity() {
                store.get('public').multi()
                    .zrange(keys.entityKey(className, applicationId), 0, QueryLimit-1)
                    .zremrangebyrank(keys.entityKey(className, applicationId), 0, QueryLimit-1)
                    .exec(function(error, results) {
                        var connectionGroup = _getRedisGroupNames();
                        var shardMulti = [];
                        for( var i = 0; i < connectionGroup.length; i++) {
                            shardMulti.push( store.get('service').multi(i) );
                        }

                        for(var i = 0; i < results[0].length; i++) {
                            var entityId = results[0][i];
                            shardMulti[getShardKey(entityId)].del(keys.entityDetail(className, entityId, applicationId))
                        }

                        async.times(connectionGroup.length, function(n, next) {
                            shardMulti[n].exec(next);
                        },function done(error, r) {
                            if( results[1] === QueryLimit ) {
                                return deleteEntity();
                            } else {
                                return callback( error );
                            }
                        });
                    });
            })();
        }, function deleteClass(callback) {
            store.get('public').srem(keys.classesKey(applicationId), className, callback);
        }, function deleteKetSet(callback) {
            store.get('service').del(keys.entityKey(className, applicationId), callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.deleteColumn = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    async.series([
        function delteMongoDB(callback){
            var column = {};

            column[input.column] = '';

            store.get('mongodb').update( keys.collectionKey(className, applicationId),
                {},
                {$unset:column},
                {multi: true},
                function(error, results) {
                    callback(error, results);
            });
        },
        function deleteRedis(callback){
            (function deleteColumn(start, end) {
                store.get('public').zrange(keys.entityKey(className, applicationId), start, end, function(error, result) {
                    if( error ) { return callback(error, result); }
                    if( result.length === 0 ) {return callback(error, result); }

                    var connectionGroup = _getRedisGroupNames();
                    var shardMulti = [];

                    for( var i = 0; i < connectionGroup.length; i++) {
                        shardMulti.push( store.get('service').multi(i) );
                    }

                    for(var i = 0; i < result.length; i++) {
                        var entityId = result[i];
                        shardMulti[getShardKey(entityId)].hdel(keys.entityDetail(className, entityId, applicationId), input.column);
                    }

                    async.times(connectionGroup.length, function(n, next) {
                        shardMulti[n].exec(next);
                    },function done(error, r) {
                        if( result.length === QueryLimit ) {
                            return deleteColumn(end+1, end + QueryLimit );
                        } else {
                            return callback( error );
                        }
                    });
                });
            })(0, QueryLimit-1);
        }
    ], function done(error, results) {
        callback(error, results[0]);
    });
};

exports.deleteField = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var shardKey = getShardKey(input._id);

    async.series([
        function isExist(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }
                callback(error, results);
            }, shardKey);
        },
        function deleteMongoDB(callback){
            var column = {};

            for(var i = 0; i < input.fields.length; i++) {
                column[input.fields[i]] = '';
            }

            store.get('mongodb').update( keys.collectionKey(className, applicationId),
                {_id: input._id},
                {$unset:column, $set:{updatedAt: input.timestamp}},
                {multi: false},
                function(error, results) {
                    callback(error, results);
                });
        },
        function deleteRedis(callback){
            var key = keys.entityDetail(className,  input._id, applicationId);
            var multi = store.get('service').multi(shardKey);

            for(var i = 0; i < input.fields.length; i++) {
                multi.hdel(key, input.fields[i]);
            }
            multi.hset(key, 'updatedAt', input.timestamp);
            multi.exec(callback);
        },
        function updateEntityIdToPublic(callback) {
            store.get('public').zadd(keys.entityKey(className, applicationId), input.timestamp, input._id, callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
    
};


exports.deleteQuery = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var classCollection = keys.collectionKey(className, applicationId);
    var condition = input.where;

    async.series([
        function deleteRedis(callback) {
            store.get('mongodb').findCount(classCollection, condition, function(error, rowCount) {
                if( error ) { return callback(error, rowCount); }
                if( rowCount === 0 ) { return callback(error, rowCount); }

                var connectionGroup = _getRedisGroupNames();
                var times = Math.ceil(rowCount / QueryLimit);
                async.times(times, function(n, next) {
                    var publicMulti = store.get('public').multi();
                    var shardMulti = [];

                    for( var i = 0; i < connectionGroup.length; i++) {
                        shardMulti.push( store.get('service').multi(i) );
                    }

                    store.get('mongodb').pagination(classCollection, condition, { pageSize: QueryLimit, pageNumber: n+1}, function(error, results) {
                        if( error ) { return next(error); }

                        for(var i = 0; i < results.length; i++ ) {
                            var shardKey = getShardKey(results[i]._id);

                            publicMulti.zrem(keys.entityKey(className, applicationId), results[i]._id);
                            shardMulti[shardKey].del(keys.entityDetail(className, results[i]._id, applicationId));
                        }

                        publicMulti.exec();
                        for( var i = 0; i < connectionGroup.length; i++) {
                            shardMulti[i].exec();
                        }

                        next(error);
                    });
                },function done(error, results) {
                    return callback(error, results);
                });
            });
        },
        function deleteMongo(callback) {
            store.get('mongodb').remove(classCollection, condition, callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};


function _getRedisGroupNames() {
    // TODO ETCD 리스트를 넘기게 수정해야함
    return ['0', '1'];
};


