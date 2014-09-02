var couchbase = require('couchbase');
var BUCKETS = config.database.buckets;

function DB() {
	var self = this;

	self.buckets = [];

	// config.js 에 저장된 BUCKETS 정보를 읽어 연결한다 
	BUCKETS.forEach( function(BUCKET) {
		self.buckets[BUCKET.bucket] = new couchbase.Connection( BUCKET, function(err) {
			if(err) {
				console.log(err);
			} else {
				log.info('[%d] Couchbase Connected', process.pid);
			}
		});
	});

};

DB.prototype.get = function get(bucket) {
	return this.buckets[bucket];
};


module.exports = new DB();