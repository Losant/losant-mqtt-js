var mqtt          = require('mqtt');
var util          = require('util');
var EventEmitter  = require('events').EventEmitter;
var config        = require('./config');
var debug         = require('debug')('losant:mqtt');

// Map of transport types to the corresponding url prefixes.
const transportPrefixes = {
  'tcp': { prefix: 'mqtt://', port: 1883 },
  'tls': { prefix: 'mqtts://', port: 8883 },
  'ws': { prefix: 'ws://', port: 80 },
  'wss': {prefix: 'wss://', port: 443 }
};

function MQTT() {
  EventEmitter.call(this);
  this.client = null;
}

util.inherits(MQTT, EventEmitter);

MQTT.prototype.connect = function(options, callback) {

  // Grab the prefix and port. Default to tls if not provided.
  var prefixPort = transportPrefixes[options.transport] ||
    transportPrefixes.tls;

  var url = prefixPort.prefix + config.mqttEndpoint;

  callback = callback || function() {};

  debug('MQTT connecting to ' + url);

  // Connect to mqtt broker.
  this.client = mqtt.connect(
    url, { clientId: options.id,
      username: options.key,
      password: options.secret,
      port: prefixPort.port });

  this.client.on('connect', (function() {
    debug('MQTT successfully connected to ' + url);
    this.emit('connect');
  }).bind(this));

  var connectComplete = false;
  this.client.once('connect', function() {
    if(!connectComplete) {
      connectComplete = true;
      callback();
    }
  });

  this.client.once('error', function(err) {
    if(!connectComplete) {
      connectComplete = true;
      callback(err);
    }
  });

  this.client.on('reconnect', (function() {
    debug('MQTT reconnecting to ' + url);
    this.emit('reconnect');
  }).bind(this));

  this.client.on('close', (function() {
    debug('MQTT disconnected from ' + url);
    this.emit('close');
  }).bind(this));

  this.client.on('offline', (function() {
    debug('MQTT offline from ' + url);
    this.emit('offline');
  }).bind(this));

  this.client.on('error', (function(err) {
    debug('MQTT error to ' + url + ' ' + String(err));
    this.emit('error', err);
  }).bind(this));

  this.client.on('message', (function(topic, message) {
    this.emit('message', topic, message);
  }).bind(this));

  return this;
};

/**
 * Whether or not the underlying mqtt client is connected.
 */
MQTT.prototype.isConnected = function() {
  return this.client ? this.client.connected : false;
};

/**
 * Publishes a message to the underlying mqtt client.
 */
MQTT.prototype.publish = function(topic, message, callback) {
  if(this.client) {
    this.client.publish(topic, message, callback);
  }
  else {
    if(callback) { callback(new Error('Device never connected.')); }
  }
};

/**
 * Subscribes to a topic.
 */
MQTT.prototype.subscribe = function(topic, callback) {
  if(this.client) {
    this.client.subscribe(topic, callback);
  }
  else {
    if(callback) { callback(new Error('Device never connected.')); }
  }
};

module.exports = MQTT;
