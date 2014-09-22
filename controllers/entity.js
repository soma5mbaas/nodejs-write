var util = require('../utils/util');
var token = require('../utils/token');
// var rabbitmq = require('../handlers/rabbitmq');
var entityHandler = require('../handlers/entity');
var schemaHandler = require('../handlers/schema');
var sendError = require('../utils/util').sendError;
var uuid = require('uuid');
var async = require('async');

// /classes/<className>					POST	Creating Entitys
exports.create = function(req, res) {
	// Header
	var input = util.getHeader(req);

	// Entity
	input.entity = req.body;
	input.entity._id = input._id = uuid();
	input.entity.createAt = input.entity.updateAt = new Date(input.timestamp);

	entityHandler.createEntity(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		schemaHandler.createSchema(input);
		
		var output = {};
		output._id = input.entity._id;
		output.createAt = input.entity.createAt;
		output.updateAt = input.entity.updateAt;

		res.json(output);
	});
};

// /classes/<className>/<_id>		PUT	Updating Entitys
exports.update = function(req, res) {
	// Header
	var input = util.getHeader(req);

	// Entity
	input.entity = req.body;
	input.entity.updateAt = new Date(input.timestamp);


	entityHandler.updateEntity(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		schemaHandler.updateSchema(input);

		var output = {};
		output._id = input.entity._id;
		output.updateAt = input.entity.updateAt;
		
		res.json(output);
	});
	
};

// /classes/<className>/<_id>		DELETE	Deleting Entitys
exports.delete = function(req, res) {
	// Header
	var input = util.getHeader(req);

	entityHandler.deleteEntity( input, function(error, result) {
		if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }
		
		var output = { _id: input._id };

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
		input.entity = request.entity;

		if( input.method === 'create' ) {
			input.entity._id = input._id = uuid();
			input.entity.createAt = input.entity.updateAt = new Date(input.timestamp);
			
			var output = {};


			entityHandler.createEntity(input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }
				

				output._id = input.entity._id;
				output.createAt = input.entity.createAt;
				output.updateAt = input.entity.updateAt;

				schemaHandler.createSchema(input);

				next(error, output);
			});
		} else if( input.method === 'update' ) {
			input.entity.updateAt = new Date(input.timestamp);
			input._id = request._id;

			var output = {};


			entityHandler.updateEntity(input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }

				output._id = input.entity._id;
				output.updateAt = input.entity.updateAt;

				schemaHandler.updateSchema(input);

				next(error, output);
			});
		} else if( input.method === 'delete' ) {
			input._id = request._id;
			
			var output = {};

			entityHandler.deleteEntity( input, function(error, result) {
				if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }

				next(error, output);
			});	
		}
	}, function done(error, outputs) {
		res.json( outputs );
	});
};



