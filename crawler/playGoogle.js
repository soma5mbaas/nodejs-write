/**
 * Created by syntaxfish on 14. 11. 1..
 */
var request = require('request');
var config = require('./playGoogle.json');
var _ = require('underscore');
var parser = require('whacko');
var async = require('async');
var moment = require('moment');
var store = require('haru-nodejs-store');
var util = require('util');



exports.requestTotal = function(applicationId, packageName, callback) {
    request(util.format(config.marketUrl, packageName, 'ko'), function(error, res, body) {
        // TODO 현재 100개 제한.

        var $ = parser.load(body);

        var total = $('meta[itemprop=ratingCount]').attr('content');

        callback(error, total);
    });
};

exports.calcPageCount = function(reviewCount) {
    return parseInt( (reviewCount/config.numberOfReview) + 1);
};