var util = require('../utils/util');
var token = require('../utils/token');
// var rabbitmq = require('../handlers/rabbitmq');
var objectHandler = require('../handlers/object');
var schemaHandler = require('../handlers/schema');
var sendError = require('../utils/util').sendError;
var uuid = require('uuid');

// /classes/<className>					POST	Creating Objects
exports.create = function(req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'create';

	// Object
	input.object = req.body;
	input.object.objectId = input.objectId = uuid();

	var properties = Object.keys(input.object);
	var schema = [];
	for(var i = 0; i < properties.length; i++) {
		var property = properties[i];
		var value = input.object[property];

		var type = typeof value;

		if( type === 'object' && Array.isArray(value) ) {
			type = 'array';
		}

		schema.push( property + '.' + type );
		input.object[property] = value.toString();
	}
	
	input.object.createAt = input.object.updateAt = input.timestamp.toString();
	schema.push('createAt.date');
	schema.push('updateAt.date');


	// Output
	output.objectId = input.object.objectId;
	output.createAt = new Date( parseInt(input.object.createAt) );
	output.updateAt = new Date( parseInt(input.object.updateAt) );


	objectHandler.createObject(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		res.json(output);
		schemaHandler.createSchema(input.applicationId, input.class, schema);
	});
};

// /classes/<className>/<objectId>		PUT	Updating Objects
exports.update = function(req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'update';

	// Object
	input.object = req.body;
	input.object.objectId = req.params.objectid;

	var properties = Object.keys(input.object);
	var schema = [];
	for(var i = 0; i < properties.length; i++) {
		var property = properties[i];
		var value = input.object[property];

		var type = typeof value;

		if( type === 'object' && Array.isArray(value) ) {
			type = 'array';
		}

		schema.push( property + '.' + type );
		input.object[property] = value.toString();
	}

	input.object.updateAt = input.timestamp.toString();

	// Output
	output.objectId = input.object.objectId;
	output.updateAt = new Date( parseInt(input.object.updateAt) );

	objectHandler.updateObject(input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);

		res.json(output);
		schemaHandler.updateSchema(input.applicationId, input.class, schema);
	});
	
};

// /classes/<className>/<objectId>		DELETE	Deleting Objects
exports.delete = function(req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'delete';
	input.object= { obejctId: req.params.objectid };

	// Output
	output.objectId = input.object.objectId;

	objectHandler.deleteObject( input, function(error, result) {
		if( error ) return sendError(res, errorCode.OTHER_CAUSE);
		res.json(output);
	});	
};

exports.batch = function(req, res) {
	var requests = req.body.requests;
	var output = [];

	for( var i = 0; i < requests.length; i++ ) {
		var obj = {};
		var request = requests[i];
		
		obj.method = request.method;

		output.push(obj);
	};

	res.json( output );
};
