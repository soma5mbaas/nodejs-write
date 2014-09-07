var util = require('../utils/util');
var token = require('../utils/token');
// var rabbitmq = require('../handlers/rabbitmq');
var objectHandler = require('../handlers/object');
var schemaHandler = require('../handlers/schema');
var sendError = require('../utils/util').sendError;
var uuid = require('uuid');

// /classes/<className>					POST	Creating Objects
exports.create = function (req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'create';

	// Object
	input.object = req.body;
	input.object.objectId = input.objectId = uuid();
	input.object.createAt = new Date();
	input.object.updateAt = new Date();


	// Output
	output.objectId = input.object.objectId;
	output.createAt = input.object.createAt;
	output.updateAt = input.object.updateAt;


	schemaHandler.createSchema(input);
	objectHandler.createObject(input);

	res.json(input);
};

// /classes/<className>/<objectId>		PUT	Updating Objects
exports.update = function (req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'update';

	// Object
	input.object = req.body;
	input.object.objectId = req.params.objectid;
	input.object.updateAt = new Date();

	// Output
	output.objectId = input.object.objectId;
	output.updateAt = input.object.updateAt;

	objectHandler.updateObject( input, function(error, result) {
		if(error) {
			// send errorCode
			return sendError(res, errorCode.OTHER_CAUSE);
		} else {
			// send result
			res.json(output);
			schemaHandler.updateSchema(input);
		}
	});
	
};

// /classes/<className>/<objectId>		DELETE	Deleting Objects
exports._delete = function (req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'delete';
	input.object.objectId = req.params.objectid;

	// Output
	output.objectId = input.object.objectId;

	objectHandler.deleteObject( input, function(error, result) {
		if(error) {
			// send errorCode
			return sendError(res, errorCode.OTHER_CAUSE);
		} else {
			// send result
			res.json(output);
		}
	});
	
};
