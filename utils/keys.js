
var nameSpace = 'dev';

exports.schemaKey = function(applicationId, className) {
	return nameSpace + ':' + applicationId +':'+ className +':schema:set';
};
