
var getHeader = require('haru-nodejs-util').common.getHeader;

var reviewHandler = require('../handlers/review');


exports.fetch = function(req, res) {
    var input = getHeader(req);

    input.options = req.body;

    reviewHandler.fetch(input, function(error, results) {
        //res.json(results);
    });

    res.json({});
};
