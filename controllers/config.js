var util = require('haru-nodejs-util');

var getHeader = util.common.getHeader;
var sendError = util.common.sendError;

var configHandler = require('../handlers/config');


exports.create = function(req, res) {
    var input = getHeader(req);

    input.config = req.body;

    configHandler.create(input, function(error, results) {
        if( error ) { return sendError(res, error, log, 'error'); }

        res.json({success: true});
    });
};

exports.delete = function(req, res) {
    var input = getHeader(req);

    input.fields = req.body.fields;

    configHandler.delete(input, function(error, results) {
        if( error ) { return sendError(res, error, log, 'error'); }

        res.json({success: true});
    });
};

exports.update = function(req, res) {
    var input = getHeader(req);

    input.config = req.body;

    configHandler.update(input, function(error, results) {
        if( error ) { return sendError(res, error, log, 'error'); }

        res.json({success: true});
    });
};