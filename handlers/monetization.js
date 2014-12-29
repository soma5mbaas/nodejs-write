/**
 * Created by syntaxfish on 14. 11. 14..
 */

var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var _ = require('underscore');

var RabbitMq = require('../connectors/rabbitmq');
var rabbitmq = new RabbitMq({monetization: config.mqueue.monetization});

exports.create = function(input, callback) {
    rabbitmq.publish('monetization', input);
    callback(null, {success: true});
};