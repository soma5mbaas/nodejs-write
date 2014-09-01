var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var object = require('./routes/object');

var token = require('./utils/token');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(token.checkToken());



app.use('/', routes);
app.use('/classes', object);


module.exports = app;
