var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var routeV1 = require('./routes/routeV1');

var token = require('./utils/token');
var cors = require('cors');

var store = require('haru-nodejs-store');
var storeConfig = require('./config').store;


var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());

// app.use(token.checkToken());

store.connect(storeConfig);

app.use('/', index);

// version 1.0
app.use('/1', routeV1);


module.exports = app;
