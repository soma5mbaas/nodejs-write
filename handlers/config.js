var keys = require('haru-nodejs-util').keys;
var store = require('haru-nodejs-store');

var _ = require('underscore');


exports.create = function(input, callback) {
    var key = keys.configKey(input.applicationId);

    store.get('public').hmset(key, _parse(input.config), callback);
};

exports.delete = function(input, callback) {
    var key = keys.configKey(input.applicationId);

    if( !_.isArray(input.fields) ) {
        input.fields = [input.fields];
    }

    store.get('public').hmdel(key, input.fields, callback );
};

exports.update = function(input, callback) {
    var key = keys.configKey(input.applicationId);

    store.get('public').hmset(key, _parse(input.config), callback);
};


function _parse(object) {
    var objectKeys = Object.keys(object);

    for( var i = 0; i < objectKeys.length; i++) {
        var key = objectKeys[i];

        if( !_.isArray(object[key]) ) {
            object[key] = [ typeof object[key], object[key] ];
        }
    }

    return object;
};