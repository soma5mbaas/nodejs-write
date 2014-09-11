var express = require('express');
var router = express.Router();
var object = require('../controllers/object');

// /classes/<className>					POST	Creating Objects
router.post( '/:classname', object.create );

// /classes/<className>/<objectId>		PUT	Updating Objects
router.put( '/:classname/:objectid', object.update );

// /classes/<className>/<objectId>		DELETE	Deleting Objects
router.delete( '/:classname/:objectid', object.delete );



module.exports = router;
