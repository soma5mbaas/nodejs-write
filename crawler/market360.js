/**
 * Created by syntaxfish on 14. 11. 7..
 */
var request = require('request');
var config = require('./market360.json');
var _ = require('underscore');
var parser = require('whacko');
var util = require('util');
var querystring = require('querystring');



exports.requestTotal = function(applicationId, packageName, callback) {
    _requestTotal(packageName, function(error, total) {
        // TODO 현재 100개 제한.
        callback(error, total);
    });
};

exports.calcPageCount = function(reviewCount) {
    return parseInt( (reviewCount/config.numberOfReview) + 1);
};

function _requestTotal( packageName, callback ) {
    _request(util.format(config.url, encodeURIComponent(packageName), 0), function (error, res, json) {
        json = JSON.parse(json);

        callback(error, json.data.total);
    });
};

function _request(url, callback){
    var  market360_options = {
        url: url,
        method: 'GET'
    };

    request(market360_options, callback);
};

