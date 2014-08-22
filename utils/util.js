
function getAPIInfo( req ) {
	var api = {};

	if( api.id = req.get('Rest-API-Id') ) {
		api.type = 'rest';
	} else if( api.id = req.get('Android-API-Id') ) {
		api.type = 'android';
	} else if( api.id = req.get('Ios-API-Id') ) {
		api.type = 'ios';
	} else if( api.id = req.get('Javascript-API-Id') ) {
		api.type = 'javascript';
	}

	return api;
};


exports.getHeader = function( req ) {
	var header = {};
	header.application_id = req.get('Application-Id');
	header.user_id = req.get('User-Id');
	header.api = getAPIInfo( req );

	return header;
};