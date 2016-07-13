var util          = require('util');
var EventEmitter  = require('events').EventEmitter;
var debug         = require('debug')('losant:device');
var EJSON         = require('mongodb-extended-json');
var config        = require('./config');
var MQTT          = require('./mqtt');

/**
 * Device constructor.
 */
function Device(options) {

  EventEmitter.call(this);

  // Check required fields.
  if(!options || !options.id) {
    throw new Error('ID is required.');
  }

  this.options = options;
  this.id = options.id;

  // Default the options and remove whitespace.
  options.id = (options.id || '').replace(/ /g, '');
  options.key = (options.key || '').replace(/ /g, '');
  options.secret = (options.secret || '').replace(/ /g, '');

  // The MQTT topics that this device will use.
  this.commandTopic = util.format(config.topicFormatCommand, options.id);
  this.stateTopic = util.format(config.topicFormatState, options.id);

  this.mqtt = options.mqtt || new MQTT();
  this.mqtt.on('message', this.handleMessage.bind(this));

  // Only want 'connect' to be emitted the first time. Every time after
  // will only emit the reconnect event.
  this.mqtt.once('connect', (function() {
    this.emit('connect');
  }).bind(this));

  this.mqtt.on('connect', this.handleConnect.bind(this));

  this.mqtt.on('reconnect', (function() {
    this.emit('reconnect');
  }).bind(this));

  this.mqtt.on('close', (function() {
    this.emit('close');
  }).bind(this));

  this.mqtt.on('offline', (function() {
    this.emit('offline');
  }).bind(this));

  this.mqtt.on('error', (function(err) {
    this.emit('error', err);
  }).bind(this));
}

util.inherits(Device, EventEmitter);

/**
 * Returns whether or not the device is connected.
 */
Device.prototype.isConnected = function() {
  return this.mqtt.isConnected();
};

/**
 * Occurs whenever the underlying mqtt client connects or reconnects.
 */
Device.prototype.handleConnect = function() {
  debug('Subscribing to MQTT topic: ' + this.commandTopic);
  this.mqtt.subscribe(this.commandTopic);
};

/**
 * Connects to the Losant platform.
 */
Device.prototype.connect = function(callback) {
  this.mqtt.connect(this.options, callback);
};

/**
 * Disconnects the underlying mqtt connection.
 */
Device.prototype.disconnect = function(callback) {
  debug('Disconnect MQTT client.');
  if(this.mqtt.client) {
    this.mqtt.client.end(callback);
  }
  else {
    callback();
  }
};

/**
 * Handles a message sent from the Losant broker.
 * topic: the mqtt topic.
 * message: the message as a Buffer.
 * Returns null if message is invalid. Returns the parsed JavaScript
 * object if the message is valid.
 */
Device.prototype.handleMessage = function(topic, message) {

  // This message is not intended for this device.
  if(topic !== this.commandTopic) {
    return null;
  }

  message = this.parseMessage(message);
  if(!message) {
    return null;
  }

  debug('Received MQTT message on topic: ' + topic);
  debug(JSON.stringify(message));

  this.emit('command', message);

  return message;
};

/**
 * Parses an incoming mqtt message from the Losant broker..
 * Returns an object or null.
 * message: the incoming Buffer to parse and validate.
 */
Device.prototype.parseMessage = function(message) {

  // Attempt to parse the message.
  try { message = EJSON.parse(message.toString()); }
  catch(e) { return null; }

  // The message has to be something.
  if(!message) {
    return null;
  }

  return message;
};

/**
 * Sends device state to Losant.
 * deviceId: the ID of the device to report state for.
 * state: the state to send. Typically an object with { attribute: value }
 * time (optional): the time at which the state occurred (defaults to now)
 * cb: the callback handling the response.
 */
Device.prototype.sendState = function(state, time, callback) {

  if(typeof(time) === 'function') {
    callback = time;
    time = null;
  }

  time = time || new Date();
  var payload = { time: time, data: state };

  debug('Publishing state:');
  debug(EJSON.stringify(payload));
  debug('Topic: ' + this.stateTopic);

  this.mqtt.publish(this.stateTopic, EJSON.stringify(payload), callback);

  return { topic: this.stateTopic, payload: payload };
};

module.exports = Device;
