var express = require('express');
var router = express.Router();

var entity = require('../controllers/entity');
var installation = require('../controllers/installation');
var user = require('../controllers/user');


// Entity
router.post( '/classes/:classname', entity.create );
router.put( '/classes/:classname/:_id', entity.update );
router.delete( '/classes/:classname/:_id', entity.delete );
router.delete( '/classes/:classname', entity.deleteClass);
router.post('/batch', entity.batch);

////Installation
router.post('/installation', installation.create);
router.put('/installation/:_id', installation.update);
router.delete('/installation/:_id', installation.delete);

//User
router.post('/user', user.create);
router.put('/user/:_id', user.update);
router.delete('/user/:_id', user.delete);


module.exports = router;

