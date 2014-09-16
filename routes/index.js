var express = require('express');
var router = express.Router();


// POST 
router.post('/', function(req, res) {
	res.json({});
});


// GET
router.get('/health', function(req, res) {
	res.json({
		pid: process.pid,
		memory: process.memoryUsage(),
		uptime: process.uptime()
	});
});

// DELTE



module.exports = router;
