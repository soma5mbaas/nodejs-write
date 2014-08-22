var tokenBucket = require('../database/couchbase').get('token');
var async = require('async');


exports.checkToken = function( req, res, next ) {
	var token = req.get('User-Token');

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
			if( error ) {
				res.json( {error: 'invalid token'});
			} else {
				next();
			}
	});	

};