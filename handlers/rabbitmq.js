var amqp       = require('amqp');
var writeQueue = config.mqueue.write_mqueue;


function RabbitMQ() {
	this.connection = {};
};

RabbitMQ.prototype.connect = function( callback ) {
	var self = this;
	self.connection = amqp.createConnection( writeQueue );

	self.connection.on('ready', function() {
		console.log('RabbitMQ Connected');
		if( callback )	callback();
	});

	self.connection.on('close', function() {
		console.log('RabbitMQ Closed');
	});
};

RabbitMQ.prototype.publish = function( q, msg ) {
	this.connection.publish(q, msg);
};

module.exports = new RabbitMQ();