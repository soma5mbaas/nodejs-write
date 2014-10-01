var tokenBucket = require('../connectors/couchbase').get('token');
var async = require('async');
var url = require('url');
var sendError = require('haru-nodejs-util').common.sendError;

exports.checkToken = function(){
	return function( req, res, next ) {
		var token = req.get('User-Token');


		if( isNotNeedToBeChecked(url.parse(req.url).pathname) ) {
			return next();
		} 

		if( token == null || token.length === 0 ) {
			return sendError( res, errorCode.MISSING_USER_TOKEN );
		}

		async.waterfall([
			function getToken(callback) {
				tokenBucket.get( token , function(error, result) {
					callback(error, result);
				});
			},
			function updateTokenTime(data, callback) {
				data.update_at = new Date();
				
				tokenBucket.set(token, data, function(error, result) {
					callback(error,result);
				});
			}
			], function(error, results) {
				if( error && error.code === 13 ) { 
					// The key does not exist on the server
					return sendError( res, errorCode.INVALID_USER_TOKEN );
				} else {
					next();
				}
		});	
	}
}

function isNotNeedToBeChecked(path) {
	var paths = [
		'/health'
	];

	for( var i = 0; i < paths.length; i++ ) {
		if( path.substr(0, paths[i].length) == paths[i] ) return true;
	}

	return false;
};
