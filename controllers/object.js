var util = require('../utils/util');
var token = require('../utils/token');
var rabbitmq = require('../handlers/rabbitmq');

// /classes/<className>					POST	Creating Objects
exports.create = function create(req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'create';
	input.object = req.body;


	rabbitmq.publish( 'write', input );
	res.json( output );
};

// /classes/<className>/<objectId>		PUT	Updating Objects
exports.update = function update(req, res) {
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'update';
	input.object = req.body;
	input.object.object_id = req.params.objectid;
	
	output.update_at = new Date();

	rabbitmq.publish(  'write', input );
	res.json( output );
	
};

// /classes/<className>/<objectId>		DELETE	Deleting Objects
exports.delete = function remove(req, res) {
	res.json({name: 'remove'});
	// Header
	var input = util.getHeader(req);
	var output = {};

	// Body
	input.class = req.params.classname;
	input.method = 'delete';
	input.object = { object_id: req.params.objectid };


	rabbitmq.publish(  'write', input );
	res.json( output );
	
};
