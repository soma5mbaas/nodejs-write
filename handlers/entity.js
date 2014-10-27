var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var _ = require('underscore');
var async = require('async');

/**
 * TODO
 * worker 수정되면 parsing 하지 않게 수정
 * **/
exports.createEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var entity = input.entity;
    var isNewClass = false;
    async.series([
        function exitsClass(callback) {
            store.get('public').sismember(keys.classesKey(applicationId), className,function(error, results) {
                if( error ) { return callback(error, results); }

                isNewClass = !Boolean(results);
                callback(error, results);
            });
        },
        function addClass(callback) {
            if( isNewClass ) {
                store.get('public').sadd(keys.classesKey(applicationId), className, callback);
            } else {
                callback(null,null);
            }
        },
        function createMongoDB(callback){
            store.get('mongodb').insert(keys.collectionKey(className, applicationId), entity, callback);
        },
        function createRedis(callback){
            store.get('service').multi()
                .hmset(keys.entityDetail(className, input._id, applicationId), entity)
                .zadd(keys.entityKey(className, applicationId), input.timestamp, input._id)
                .exec(callback);
        }
    ], function done(error, results) {
        if( isNewClass ) {
            store.get('mongodb').addShardCollection(keys.collectionKey(className, applicationId));
        }
        
        callback(error, results);
    });
};

exports.updateEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;
    var entity = input.entity;

    async.series([
        function isExist(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }
                callback(error, results);
            });
        },
        function updateMongoDB(callback){
            store.get('mongodb').update(keys.collectionKey(className, applicationId),{_id: input._id}, {$set: entity}, callback);
        },
        function updateRedis(callback){
            store.get('service').multi()
                .hmset(keys.entityDetail(className, input._id, applicationId), entity)
                .zadd(keys.entityKey(className, applicationId), input.timestamp, input._id)
                .exec(callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.deleteEntity = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    async.series([
        function isExist(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }
                callback(error, results);
            });
        },
        function deleteMongoDB(callback){
            store.get('mongodb').remove(keys.collectionKey(className, applicationId),{_id: input._id}, callback);
        },
        function deleteRedis(callback){
            store.get('service').multi()
                .del(keys.entityDetail(className, input._id, applicationId))
                .zrem(keys.entityKey(className, applicationId), input._id)
                .exec(callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
};

exports.deleteClass = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    async.series([
        function deleteMongoDB(callback){
            store.get('mongodb').drop(keys.collectionKey(className, applicationId), callback);
        },
        function deleteRedis(callback){
            var total = 0;
            var maxRow = 5000;

            var deleteClass = function() {
                store.get('service').multi()
                    .zrange(keys.entityKey(className, applicationId), 0, maxRow-1)
                    .zremrangebyrank(keys.entityKey(className, applicationId), 0, maxRow-1)
                    .exec(function(error, results) {
                        var multi = store.get('service').multi();
                        total += results[1];

                        for(var i = 0; i < results[0].length; i++) {
                            multi.del(keys.entityDetail(className, results[0][i], applicationId))
                        }
                        multi.exec(function (error, result) {
                            if( results[1] === maxRow ) {
                                return process.nextTick(deleteClass);
                            }

                            return callback( null, total );
                        });
                    });
            };
            process.nextTick(deleteClass);

        },
    ], function done(error, results) {
        callback(error, results);
    });
}

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
            var total = 0;

            var maxRow = 5000;
            var count = 0;

            var deleteColumn = function() {
                var start = maxRow * count;
                var end =  ((maxRow*(count+1))-1);
                store.get('service').zrange(keys.entityKey(className, applicationId), start, end, function(error, results) {
                    if( results.length === 0) { return callback(error, total); }

                    var multi = store.get('service').multi();
                    total += results.length;

                    for( var i = 0; i < results.length; i++ ) {
                        multi.hdel(keys.entityDetail(className, results[i], applicationId), input.column);
                    }
                    
                    multi.exec(function(error, result) {
                        if( results.length < maxRow ) {
                          return callback(error, total);
                        }

                        count++;
                        return process.nextTick(deleteColumn);
                    });
                });
            };

            process.nextTick(deleteColumn);
        }
    ], function done(error, results) {
        callback(error, results[0]);
    });
};

exports.deleteField = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    async.series([
        function isExist(callback) {
            store.get('service').hget( keys.entityDetail(className, input._id, applicationId), '_id', function(error, results) {
                if(results == null) { return callback(errorCode.MISSING_ENTITY_ID, results); }
                callback(error, results);
            });
        },
        function delteMongoDB(callback){
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
            var multi = store.get('service').multi();

            for(var i = 0; i < input.fields.length; i++) {
                multi.hdel(key, input.fields[i]);
            }
            multi.hset(key, 'updatedAt', input.timestamp);
            multi.exec(callback);
        }
    ], function done(error, results) {
        callback(error, results);
    });
    
};

exports.deleteQuery = function(input, callback) {
    var className = input.class;
    var applicationId = input.applicationId;

    var idList = [];
    var entityKeyList = [];

    var deleteIdMulti;
    var deleteEntityMulti;

    async.series([
        function doQuery(callback) {
            store.get('mongodb').find(keys.collectionKey(className, applicationId), input.where, function(error, results) {
                if( error ) { return callback(error, results); }

                if(results.length > 0) {
                    deleteIdMulti = store.get('service').multi();
                    deleteEntityMulti = store.get('service').multi();
                }

                for(var i = 0; i < results.length; i++ ) {

                    deleteEntityMulti.del(keys.entityDetail(className, results[i]._id, applicationId));

                    idList.push(results[i]._id);
                    entityKeyList.push(keys.entityDetail(className, results[i]._id, applicationId));
                }

                callback(error, null);
            });
        },
        function deleteDB(callback){
            if( idList.length < 1 ) { return callback(null, null); }


            async.parallel([
                function deleteMongoDb(callback) {
                    store.get('mongodb').remove(keys.collectionKey(className, applicationId), input.where, callback);
                },
                function deleteRedisKey(callback) {

                },
                function deleteRedisDetail(callback) {

                }
            ], function done(error, results) {
            
            });
        
        },
    ], function done(error, results) {
    
    });

};
