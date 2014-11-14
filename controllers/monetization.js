var util = require('haru-nodejs-util');

var getHeader = util.common.getHeader;
var sendError = util.common.sendError;

var monetizationHandler = require('../handlers/monetization');


exports.create = function(req, res) {
    var input = getHeader(req);

    input.monetization = req.body;

    monetizationHandler.create(input, function(error, results) {
        if( error ) { return sendError(res, error, log, 'error'); }

        res.json({success: true});
    });
};
