var util = require('haru-nodejs-util');
var _ = require('underscore');

var getHeader = util.common.getHeader;
var sendError = util.common.sendError;

var entityHandler = require('../handlers/entity');
var schemaHandler = require('../handlers/schema');
var classHandler = require('../handlers/class');


var isEmptyObject = require('haru-nodejs-util').common.isEmptyObject;


var uuid = require('uuid');
var async = require('async');
var _ = require('underscore');


// /classes/<className>					POST	Creating Entitys
exports.create = function(req, res) {
	// Header
	var input = getHeader(req);


	if( !_.isEmpty(req.body) ) {
		// create Entity

		input.entity = req.body;
		input.entity.createdAt = input.entity.updatedAt = input.timestamp;

		entityHandler.createEntity(input, function(error, result) {
			if( error ) { return sendError(res, error, log, 'error'); }

			schemaHandler.createSchema(input);

			var output = {};
			output._id = input.entity._id;
			output.createdAt = input.entity.createdAt;
			output.updatedAt = input.entity.updatedAt;

			res.json(output);
		});
	} else {
		// create Class

		classHandler.create(input, function(error, results) {
			if( error ) { return sendError(res, error, log, 'error'); }

			input.entity = {};
			schemaHandler.createSchema(input);

			res.json( {success: true} );
		});
	}

};

// /classes/<className>/<_id>		PUT	Updating Entitys
exports.update = function(req, res) {
	// Header
	var input = getHeader(req);

	// Entity
	input.entity = req.body;
	input.entity.updatedAt = input.timestamp;
    delete input.entity._id;

	entityHandler.updateEntity(input, function(error, result) {
		if( error ) { return sendError(res, error, log, 'error'); }

		schemaHandler.updateSchema(input);

		var output = {};
		output._id = input._id;
		output.updatedAt = input.entity.updatedAt;

		res.json(output);
	});

};
// /classes/<className>/<_id>		DELETE	Deleting Entitys
exports.delete = function(req, res) {
	// Header
	var input = getHeader(req);

    if( req.body.fields ) {
		// delete fields
        input.fields = req.body.fields;

        entityHandler.deleteField( input, function(error, result) {
			if( error ) { return sendError(res, error, log, 'error'); }

            var output = { _id: input._id };
            res.json(output);
        });
    } else {
        entityHandler.deleteEntity( input, function(error, result) {
			if( error ) { return sendError(res, error, log, 'error'); }
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
			input.entity.createdAt = input.entity.updatedAt = input.timestamp;

			var output = {};


			entityHandler.createEntity(input, function(error, result) {
				if( error ) { return sendError(res, error, log, 'error'); }


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
				if( error ) { return sendError(res, error, log, 'error'); }

				output._id = input.entity._id;
				output.updatedAt = input.entity.updatedAt;

				schemaHandler.updateSchema(input);

				next(error, output);
			});
		} else if( input.method === 'delete' ) {
			input._id = request._id;

			var output = {};

			entityHandler.deleteEntity( input, function(error, result) {
				if( error ) { return sendError(res, error, log, 'error'); }

				next(error, output);
			});
		} else if( input.method === 'deleteFields') {
			input._id = request._id;
			input.fields = request.fields;

			var output = {};

			entityHandler.deleteField( input, function(error, result) {
				if( error ) { return sendError(res, error, log, 'error'); }

				var output = { _id: input._id };
				next(null, output);
			});

		} else {
			next(null, {success: false});
		}
	}, function done(error, outputs) {
		res.json( { results : outputs } );
	});
};


exports.deleteClass = function(req, res) {
    var input = getHeader(req);

    if(req.body.column) {
		// delete column
        input.column = req.body.column;
        entityHandler.deleteColumn(input, function (error, result) {
			if( error ) { return sendError(res, error, log, 'error'); }

            schemaHandler.deleteColumnSchema(input);
            res.json({});
        });
    }  else if( req.body.where) {
		// delete quey

		input.where = req.body.where;

		entityHandler.deleteQuery(input, function(error, results) {
			if( error ) { return sendError(res, error, log, 'error'); }

			res.json({});
		});
	} else {
		// delete class
        entityHandler.deleteClass(input, function (error, result) {
			if( error ) { return sendError(res, error, log, 'error'); }

            schemaHandler.deleteSchema(input);
            res.json({});
        });
    }
};

