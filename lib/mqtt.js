var mqtt          = require('mqtt');
var util          = require('util');
var EventEmitter  = require('events');
var config        = require('./config');
var debug         = require('debug')('losant:mqtt');

// Map of transport types to the corresponding url prefixes.
const transportPrefixes = {
  'tcp': { prefix: 'mqtt://', port: 1883 },
  'tls': { prefix: 'mqtts://', port: 8883 },
  'ws': { prefix: 'ws://', port: 80 },
  'wss': {prefix: 'wss://', port: 443 }
};

var MQTT = function() {
  this.client = null;
};

MQTT.prototype.connect = function(options, callback) {

  // Grab the prefix and port. Default to tls if not provided.
  var prefixPort = transportPrefixes[options.transport] ||
    transportPrefixes.tls;

  var url = prefixPort.prefix + config.mqttEndpoint;

  debug('MQTT connecting to ' + url);

  // Connect to mqtt broker.
  this.client = mqtt.connect(
    url, { clientId: options.id,
      username: options.key,
      password: options.secret,
      port: prefixPort.port });

  if(callback) {
    this.client.once('connect', callback);
  }

  this.client.on('connect', (function(connack) {
    debug('MQTT successfully connected to ' + url);
    this.emit('connect', connack);
  }).bind(this));

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
    debug('MQTT error to ' + url + ' ' + err.toString());
    this.emit('error', err);
  }).bind(this));

  this.client.on('message', this.handleMessage.bind(this));

  return this;
};

MQTT.prototype.handleMessage = function(topic, message) {
  this.emit('message', topic, message);
};

util.inherits(MQTT, EventEmitter);

module.exports = MQTT;
