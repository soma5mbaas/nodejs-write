var express = require('express');
var router = express.Router();
var entity = require('../controllers/entity');



// entity 
router.post( '/classes/:classname', entity.create );
router.put( '/classes/:classname/:_id', entity.update );
router.delete( '/classes/:classname/:_id', entity.delete ); 
router.post('/batch', entity.batch);



module.exports = router;
