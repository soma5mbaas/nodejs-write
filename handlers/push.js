var async = require('async');
var _ = require('underscore');

var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var InstallationsClass = 'Installations';
var UsersClass = 'Users';
var QueryLimit = 10000;

var RabbitMq = require('../connectors/rabbitmq');
var rabbitmq = new RabbitMq({push: config.mqueue.push});

exports.pushNotification = function(options, notification, callback) {
    var userCollection =  keys.collectionKey(UsersClass, options.applicationId);
    var installationCollection = keys.collectionKey(InstallationsClass, options.applicationId);

    async.waterfall([
        function countTotalUsers(callback) {
            if( options.where.users ) {
                store.get('mongodb').findCount(userCollection, options.where.users, function(error, results) {
                    callback(error, results);
                })
            } else {
                callback(null, null);
            }
        },
        function countInstallations(userCount, callback) {
            if( userCount ){
                // user , installation join query count
                var times = Math.ceil(userCount / QueryLimit);

                async.times(times, function(n, next) {
                    var page = { pageSize: QueryLimit, pageNumber: n+1};
                    store.get('mongodb').pagination( userCollection, options.where.users, page,function(error, userList) {
                        if(userList) {
                            var userIds = [];
                            for(var i = 0; i < userList.length; i++) {
                                userIds.push(userList[i]._id);
                            }

                            var condition = _.clone(options.where.installations);
                            condition['userId'] = {$in: userIds};

                            var msg = {
                                page: page,
                                options: options,
                                notification: notification
                            };

                            rabbitmq.publish('push', msg);

                            store.get('mongodb').findCount(installationCollection, condition, function(error, count) {
                                next(error, count);
                            });
                        } else {
                            next(null, 0);
                        }

                    });
                },function done(error, results) {
                    var sum = 0;
                    for( var i = 0; i < results.length; i++ ) {
                        sum += results[i];
                    }

                    return callback(error, sum);
                });
            } else if(userCount === 0) {
                callback(null, 0);
            } else {
                // installation query count
                store.get('mongodb').findCount(installationCollection,  options.where.installations, function(error, count) {
                    var times = (count /QueryLimit) + 1;
                    for( var i = 1; i <= times; i++) {
                        var page = { pageSize: QueryLimit, pageNumber: i};

                        var msg = {
                            page: page,
                            options: options,
                            notification: notification
                        };

                        rabbitmq.publish('push', msg);
                    }
                    callback(error, count)
                });
            }
        }
    ], function done(error, results) {
        callback(error, results);
    });

};
