var util = require('haru-nodejs-util');
var _ = require('underscore');

var getHeader = util.common.getHeader;
var sendError = util.common.sendError;

var token = require('../utils/token');

var entityHandler = require('../handlers/entity');
var schemaHandler = require('../handlers/schema');

var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;


var uuid = require('uuid');
var async = require('async');

// /classes/<className>					POST	Creating Entitys
exports.create = function(req, res) {
	// Header
	var input = getHeader(req);

	input.method = 'create';


	// Entity
	input.entity = req.body;
	input.entity._id = input._id = uuid();
	input.entity.createdAt = input.entity.updatedAt = input.timestamp;

	entityHandler.createEntity(input, function(error, result) {
		if( error ) { return sendError(res, error); }

		schemaHandler.createSchema(input);

		var output = {};
		output._id = input.entity._id;
		output.createdAt = input.entity.createdAt;
		output.updatedAt = input.entity.updatedAt;

		res.json(output);
	});
};

// /classes/<className>/<_id>		PUT	Updating Entitys
exports.update = function(req, res) {
	// Header
	var input = getHeader(req);

	// Entity
	input.entity = req.body;
	input.entity.updatedAt = input.timestamp;


	entityHandler.updateEntity(input, function(error, result) {
        if( error ) { return sendError(res, error); }

		schemaHandler.updateSchema(input);

		var output = {};
		output._id = input.entity._id;
		output.updatedAt = input.entity.updatedAt;

		res.json(output);
	});

};

// /classes/<className>/<_id>		DELETE	Deleting Entitys
exports.delete = function(req, res) {
	// Header
	var input = getHeader(req);

    if( req.body.fields ) {
        input.fields = req.body.fields;

        entityHandler.deleteField( input, function(error, result) {
            if( error ) { return sendError(res, error); }

            var output = { _id: input._id };
            res.json(output);
        });
    } else {
        entityHandler.deleteEntity( input, function(error, result) {
            if( error ) { return sendError(res, error); }
            var output = { _id: input._id };
            res.json(output);
        });
    }
};

exports.batch = function(req, res) {
	var header = getHeader(req);
	var requests = req.body.requests;

	async.times(requests.length, function(n, next) {
		var obj = {};
		var input = getHeader(req);
		var request = requests[n];

		input.method = request.method;
		input.class = request.class;
		input.entity = request.entity;

		if( input.method === 'create' ) {
			input.entity._id = input._id = uuid();
			input.entity.createdAt = input.entity.updatedAt = input.timestamp;

			var output = {};


			entityHandler.createEntity(input, function(error, result) {
                if( error ) { return sendError(res, error); }


				output._id = input.entity._id;
				output.createdAt = input.entity.createdAt;
				output.updatedAt = input.entity.updatedAt;

				schemaHandler.createSchema(input);

				next(error, output);
			});
		} else if( input.method === 'update' ) {
			input.entity.updatedAt = input.timestamp;
			input._id = request._id;

			var output = {};


			entityHandler.updateEntity(input, function(error, result) {
                if( error ) { return sendError(res, error); }

				output._id = input.entity._id;
				output.updatedAt = input.entity.updatedAt;

				schemaHandler.updateSchema(input);

				next(error, output);
			});
		} else if( input.method === 'delete' ) {
			input._id = request._id;

			var output = {};

			entityHandler.deleteEntity( input, function(error, result) {
                if( error ) { return sendError(res, error); }

				next(error, output);
			});
		}
	}, function done(error, outputs) {
		res.json( outputs );
	});
};


exports.deleteClass = function(req, res) {
    var input = getHeader(req);

    if(req.body.column) {
        input.column = req.body.column;
        entityHandler.deleteColumn(input, function (error, result) {
            if( error ) { return sendError(res, error); }

            schemaHandler.deleteColumnSchema(input);
            res.json({});
        });
    } else {
        entityHandler.deleteClass(input, function (error, result) {
            if( error ) { return sendError(res, error); }

            schemaHandler.deleteSchema(input);
            res.json({});
        });
    }
};