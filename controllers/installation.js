var util = require('haru-nodejs-util');
var getHeader = util.common.getHeader;
var sendError = util.common.sendError;

var entityHandler = require('../handlers/entity');
var schemaHandler = require('../handlers/schema');


var uuid = require('uuid');

var InstallationClass = 'Installation';


exports.create = function (req, res) {
    var input = getHeader(req);

    input.method = 'create';

    // Installation Entity
    input.entity = req.body;
    input.entity._id = input._id = uuid();
    input.entity.createAt = input.entity.updateAt = input.timestamp;
    input.class = InstallationClass;

    entityHandler.createEntity(input, function (error, result) {
        if(error) { return sendError(res, errorCode.OTHER_CAUSE); }

        schemaHandler.createInstallationSchema(input);

        var output = {};
        output._id = input.entity._id;
        output.createAt = input.entity.createAt;
        output.updateAt = input.entity.updateAt;

        res.json(output);
    });
};

exports.update = function(req, res) {
    // Header
    var input = getHeader(req);

    input.method = 'update';

    // Installation Entity
    input.entity = req.body;
    input.entity.updateAt = input.timestamp;
    input.class = InstallationClass

    entityHandler.updateEntity(input, function(error, result) {
        if( error ) return sendError(res, errorCode.OTHER_CAUSE);

        schemaHandler.updateSchema(input);

        var output = {};
        output._id = input.entity._id;
        output.updateAt = input.entity.updateAt;

        res.json(output);
    });

};

exports.delete = function(req, res) {
    // Header
    var input = getHeader(req);

    input.method = 'delete';
    input.class = InstallationClass;

    entityHandler.deleteEntity( input, function(error, result) {
        if( error ) { return sendError(res, errorCode.OTHER_CAUSE); }

        var output = { _id: input._id };

        res.json(output);
    });
};
