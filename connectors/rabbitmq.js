var amqp = require('amqplib/callback_api');
var queues = require('../config').mqueue;
var uuid = require('uuid');
var async = require('async');


function RabbitMQ() {
	this.connection = {};

	var self = this;

	amqp.connect( queues.write.url, function(error, conn) {
		self.connection.write = conn;
		log.info('[%d] rabbitmq write connected', process.pid);
	});

	amqp.connect( queues.schema.url, function(error, conn) {
		self.connection.schema = conn;
		log.info('[%d] rabbitmq schema connected', process.pid);
	});

};

RabbitMQ.prototype.connect = function() {
	var self = this;

	amqp.connect( queues.write.url, function(error, conn) {
		self.connection.write = conn;
		log.info('[%d] rabbitmq write connected', process.pid);
	});

	amqp.connect( queues.schema, function(error, conn) {
		self.connection.schema = conn;
		log.info('[%d] rabbitmq schema connected', process.pid);
	});

};	

RabbitMQ.prototype.publish = function(qname, data, callback) {
	var self = this;

	async.waterfall([
			function checkConnect(callback) {
				var conn = self.connection[qname];
				var error = null;

				if(conn === null || conn === undefined) {
					error = new Error('RabbitMQ Connect error');
				}

				callback( error, conn );
			},
			function createChannel(conn, callback) {
				conn.createChannel(function(error, channel) {
					callback( error, channel );					
				});
			},
			function assertQueue(channel, callback) {
				channel.assertQueue(qname, {durable: true, exclusive: false}, function(error, ok) {
					callback( error, ok, channel );
				});
			},
			function sendToQueue(ok, channel, callback) {
				var strData = JSON.stringify(data);
				var error = null;

				// log.info('[%d] send to %s data : %s', process.pid, qname, strData);
				if( !data.method )
					log.debug('[%d] method : %s', process.pid, strData );

				channel.sendToQueue(qname, new Buffer(strData));
				channel.close();

				callback( error, null );
			}
		], 
		function done(error, result) {
			if( error ) { log.error('[%d] Queue(%s) error : %s', process.pid, qname, error.message); }

			if( typeof callback === 'function' ) { 
				return callback( error, result ); 
			}
	});
};

RabbitMQ.prototype.rpc = function(qname, data, callback) {
	// var conn = this.connection[qname];

	// if(conn === null || conn === undefined){
	// 	log.error('[%d] rabbitmq %s connection not found', process.id, qname);
	// 	return;
	// };

	if( conn ) {
		conn.createChannel(function(error, ch) {
			var correlationId = uuid();	
			var rply_queue = 'rply_queue:' + process.pid;


			ch.assertQueue(rply_queue, {exclusive: true}, function(error, ok) {
				var queue = rply_queue;

				var strData = JSON.stringify(data);

				ch.consume(queue, function(msg) {
					if (msg.properties.correlationId === correlationId) {
						callback(msg.content.toString());
					} else {
						log.debug(msg.properties.correlationId);
					}

					ch.close();

				}, {noAck: false});

				log.info('[%d] send to %s data : %s', process.pid, qname, strData);
				ch.sendToQueue(qname, new Buffer(strData), {replyTo: queue, correlationId: correlationId} );

			});
		});
	}

	amqp.connect( queues.write.url , function(error, conn) {
		if( conn ) {
			conn.createChannel(function(error, ch) {
				var correlationId = uuid();	
			
				ch.assertQueue('', {exclusive: true}, function(error, ok) {
					var queue = ok.queue;

					var strData = JSON.stringify(data);

					ch.consume(queue, function(msg) {
						if (msg.properties.correlationId === correlationId) {
							callback(msg.content.toString());
						} else {
							log.debug(msg.properties.correlationId);
						}

						ch.close();
						conn.close();

					}, {noAck: true});

					log.info('[%d] send to %s data : %s', process.pid, qname, strData);
					ch.sendToQueue(qname, new Buffer(strData), {replyTo: queue, correlationId: correlationId} );

				});
			});
		}
	})
};

module.exports =  new RabbitMQ();