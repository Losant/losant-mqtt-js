/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Losant IoT, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const util          = require('util');
const EventEmitter  = require('events').EventEmitter;
const debug         = require('debug')('losant:device');
const LJSON         = require('./ljson');
const config        = require('./config');
const MQTT          = require('./mqtt');

/**
 * Device constructor.
 * @param {Object} options - id, key and secret
 * @return {undefined} undefined
 */
const Device = function(options) {

  EventEmitter.call(this);

  // Check required fields.
  if (!options || !options.id) {
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
  // will only emit the reconnected event.
  let firstConnect = true;
  this.mqtt.on('connect', (function() {
    this.handleConnect();
    if (firstConnect) {
      firstConnect = false;
      this.emit('connect');
    } else {
      this.emit('reconnected');
    }
  }).bind(this));

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
};

util.inherits(Device, EventEmitter);

/**
 * Returns whether or not the device is connected.
 * @return {Boolean} true if the device is connceted
 */
Device.prototype.isConnected = function() {
  return this.mqtt.isConnected();
};

/**
 * Occurs whenever the underlying mqtt client connects or reconnects.
 * @return {Undefined} undefined
 */
Device.prototype.handleConnect = function() {
  debug(`Subscribing to MQTT topic: ${this.commandTopic}`);
  this.mqtt.subscribe(this.commandTopic);
};

/**
 * Connects to the Losant platform.
 * @param {Function} callback a function that will be run when the connection occurs
 * @return {Undefined} undefined
 */
Device.prototype.connect = function(callback) {
  this.mqtt.connect(this.options, callback);
};

/**
 * Disconnects the underlying mqtt connection.
 * @param {Function} callback a callback that will be called when the device has disconncted
 * @return {Undefined} undefined
 */
Device.prototype.disconnect = function(callback) {
  debug('Disconnect MQTT client.');
  if (this.mqtt.client) {
    this.mqtt.client.end(callback);
  } else {
    return callback();
  }
};

/**
 * Handles a message sent from the Losant broker.
 * @param {String} topic the mqtt topic
 * @param {Buffer} message the message as a buffer
 * @return {Object|Null} null if message is invalid. Returns the parsed JavaScript
 * object if the message is valid.
 */
Device.prototype.handleMessage = function(topic, message) {

  // This message is not intended for this device.
  if (topic !== this.commandTopic) {
    return null;
  }

  message = this.parseMessage(message);
  if (!message) {
    return null;
  }

  debug(`Received MQTT message on topic: ${topic}`);
  debug(LJSON.stringify(message));

  this.emit('command', message);

  return message;
};

/**
 * Parses an incoming mqtt message from the Losant broker.
 * @param {Buffer} message the incoming Buffer to parse and validate.
 * @return {Object|Null} null if message is invalid. Returns the parsed JavaScript
 * object if the message is valid.
 */
Device.prototype.parseMessage = function(message) {

  // Attempt to parse the message.
  try {
    message = LJSON.parse(message.toString());
  } catch (e) {
    return null;
  }

  // The message has to be something.
  if (!message) {
    return null;
  }

  return message;
};

/**
 * Sends device state to Losant.
 * deviceId: the ID of the device to report state for.
 * @param {String} state the state to send. Typically an object with { attribute: value }
 * @param {Date} time (optional) the time at which the state occurred (defaults to now)
 * @param {Function} callback: the callback handling the response.
 * @return {Object} an object containing topic and payload
 */
Device.prototype.sendState = function(state, time, callback) {

  if (typeof(time) === 'function') {
    callback = time;
    time = null;
  }

  time = time || new Date();
  const payload = { time: time, data: state };

  debug('Publishing state:');
  debug(LJSON.stringify(payload));
  debug(`Topic: ${this.stateTopic}`);

  this.mqtt.publish(this.stateTopic, LJSON.stringify(payload), callback);

  return { topic: this.stateTopic, payload: payload };
};

module.exports = Device;
