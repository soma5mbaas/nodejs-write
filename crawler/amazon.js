/**
 * Created by syntaxfish on 14. 11. 1..
 */
var request = require('request');
var config = require('./amazon.json');
var _ = require('underscore');
var parser = require('whacko');
var util = require('util');



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
    _request(util.format(config.url, packageName, 1, 1), function (error, res, html) {
        var mainSelector = config.mainSelector;
        var $ = parser.load(html);

        var match = $(mainSelector);
        if( match.length === 0 ) {
            log.info('[%s:%d]: amazon fail', packageName, 1 );
            return _requestTotal(packageName, callback);
        }

        var total = $('div.a-row.a-spacing-medium.customerReviews').find('span.a-size-medium')[1].children[0].data.replace(/,/g, '');
        callback( error, parseInt(total) );
    });
};


function _request(url, callback){
    var  amazon_options = {
        url: url,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ko-KR,ko;q=0.8,en-UxS;q=0.6,en;q=0.4',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Host':'www.amazon.com'
        }
    };

    request(amazon_options, callback);
};