var util = require('../utils/util');
var token = require('../utils/token');
// var rabbitmq = require('../handlers/rabbitmq');
var objectHandler = require('../handlers/object');
var schemaHandler = require('../handlers/schema');
var sendError = require('../utils/util').sendError;
var uuid = require('uuid');
var async = require('async');

// /classes/<className>					POST	Creating Objects
exports.create = function(req, res) {
	// Header
	var input = util.getHeader(req);

	// Object
	input.object = req.body;
	input.object.objectId = input.objectId = uuid();
	input.object.createAt = input.object.updateAt = new Date(input.timestamp);

	objectHandler.createObject(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		schemaHandler.createSchema(input);
		
		var output = {};
		output.objectId = input.object.objectId;
		output.createAt = input.object.createAt;
		output.updateAt = input.object.updateAt;

		res.json(output);
	});
};

// /classes/<className>/<objectId>		PUT	Updating Objects
exports.update = function(req, res) {
	// Header
	var input = util.getHeader(req);

	// Object
	input.object = req.body;
	input.object.updateAt = new Date(input.timestamp);


	objectHandler.updateObject(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		schemaHandler.updateSchema(input);

		var output = {};
		output.objectId = input.object.objectId;
		output.updateAt = input.object.updateAt;
		
		res.json(output);
	});
	
};

// /classes/<className>/<objectId>		DELETE	Deleting Objects
exports.delete = function(req, res) {
	// Header
	var input = util.getHeader(req);

	objectHandler.deleteObject( input, function(error, result) {
		if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }
		
		var output = {};
		output.objectId = input.objectId;

		res.json(output);
	});	
};

exports.batch = function(req, res) {
	var header = util.getHeader(req);
	var requests = req.body.requests;

	async.times(requests.length, function(n, next) {
		var obj = {};
		var input = util.getHeader(req);
		var request = requests[n];

		input.method = request.method;
		input.class = request.class;
		input.object = request.object;

		if( input.method === 'create' ) {
			input.object.objectId = input.objectId = uuid();
			input.object.createAt = input.object.updateAt = new Date(input.timestamp);
			
			var output = {};


			objectHandler.createObject(input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }
				

				output.objectId = input.object.objectId;
				output.createAt = input.object.createAt;
				output.updateAt = input.object.updateAt;

				schemaHandler.createSchema(input);

				next(error, output);
			});
		} else if( input.method === 'update' ) {
			input.object.updateAt = new Date(input.timestamp);
			input.objectId = request.objectId;

			var output = {};


			objectHandler.updateObject(input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }

				output.objectId = input.object.objectId;
				output.updateAt = input.object.updateAt;

				schemaHandler.updateSchema(input);

				next(error, output);
			});
		} else if( input.method === 'delete' ) {
			input.objectId = request.objectId;
			
			var output = {};

			objectHandler.deleteObject( input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }

				next(error, output);
			});	
		}
	}, function done(error, outputs) {
		res.json( outputs );
	});
};



