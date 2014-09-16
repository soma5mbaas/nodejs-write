var express = require('express');
var router = express.Router();
var object = require('../controllers/object');



// object 
router.post( '/classes/:classname', object.create );
router.put( '/classes/:classname/:objectid', object.update );
router.delete( '/classes/:classname/:objectid', object.delete ); 
router.post('/batch', object.batch);



module.exports = router;
