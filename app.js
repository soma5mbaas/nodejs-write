var express = require('express');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var routeV1 = require('./routes/routeV1');

var cors = require('cors');

var store = require('haru-nodejs-store');
var analysis = require('haru-nodejs-analysis');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cors());
app.use(analysis({analysis: config.mqueue.analysis}));

store.connect(config.store);

app.use('/', index);

// version 1.0
app.use('/1', routeV1);


module.exports = app;
