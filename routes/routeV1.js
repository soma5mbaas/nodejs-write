var express = require('express');
var router = express.Router();

var entity = require('../controllers/entity');
var config = require('../controllers/config');
var review = require('../controllers/review');
var push = require('../controllers/push');
var monetization = require('../controllers/monetization');



// Entity
router.post( '/classes/:classname', entity.create );
router.put( '/classes/:classname/:_id', entity.update );

router.delete( '/classes/:classname/:_id', entity.delete ); // delete entity, delete fields
router.delete( '/classes/:classname', entity.deleteClass);  // delete class, delete column

router.post('/batch', entity.batch);

// config
router.post('/config', config.create);
router.put('/config', config.update);
router.delete('/config', config.delete);

// review Crawler
router.post('/reviews/fetch', review.fetch);

// push
router.post('/push', push.push);

// monetization
router.post('/monetization', monetization.create);

module.exports = router;

