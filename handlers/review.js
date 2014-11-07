var _ = require('underscore');
var async = require('async');

var crawler = require('../crawler');

var RabbitMq = require('../connectors/rabbitmq');
var rabbitmq = new RabbitMq({crawler: require('../config').mqueue.crawler});


exports.fetch = function(input, callback) {
    var options = input.options;
    var markets = Object.keys(options);


    async.times(markets.length, function(n, next) {
        var market = markets[n];
        var option = options[market];

        option['market'] = market;

        if( typeof crawler[market] === 'object'){
            option['locations'].forEach(function(location) {
                var msg  = {
                    market: market,
                    page: 1,
                    location: location,
                    packageName: option.packageName,
                    applicationId: input.applicationId
                };

                rabbitmq.publish('crawler',msg, {priority: 0});
            });
        } else {
            next(null, null);
        }
    },function done(error, results) {
        callback(error, {});
    });
};