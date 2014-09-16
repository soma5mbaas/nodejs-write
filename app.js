var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var routeV1 = require('./routes/routeV1');

var token = require('./utils/token');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


// app.use(token.checkToken());


app.use('/', index);

// version 1.0
app.use('/1', routeV1);


module.exports = app;
