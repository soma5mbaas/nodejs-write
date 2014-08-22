var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var object = require('./routes/object');

var checkToken = require('./utils/token').checkToken;

var app = express();

process.env.TZ = 'Asia/Seoul';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

routes.use( checkToken );
app.use('/', routes);

object.use( checkToken );
app.use('/classes', object);


module.exports = app;
