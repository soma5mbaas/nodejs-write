var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var object = require('./routes/object');

var checkToken = require('./utils/token').checkToken;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use('/', routes);

object.use( checkToken );
app.use('/classes', object);


module.exports = app;
