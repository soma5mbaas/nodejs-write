var express = require('express');
var router = express.Router();

var entity = require('../controllers/entity');
var config = require('../controllers/config');
var review = require('../controllers/review');

var installation = require('../controllers/installation');
var user = require('../controllers/user');


// Entity
router.post( '/classes/:classname', entity.create );
router.put( '/classes/:classname/:_id', entity.update );

router.delete( '/classes/:classname/:_id', entity.delete ); // delete entity, delete fields
router.delete( '/classes/:classname', entity.deleteClass);  // delete class, delete column

router.post('/batch', entity.batch);


////Installation
//router.post('/installation', installation.create);
//router.put('/installation/:_id', installation.update);
//router.delete('/installation/:_id', installation.delete);

//User
//router.post('/user', user.create);
//router.put('/user/:_id', user.update);
//router.delete('/user/:_id', user.delete);

// config
router.post('/config', config.create);
router.put('/config', config.update);
router.delete('/config', config.delete);

// review Crawler
router.post('/reviews/fetch', review.fetch);

module.exports = router;

