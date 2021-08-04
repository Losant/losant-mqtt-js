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

const mqtt          = require('mqtt');
const util          = require('util');
const EventEmitter  = require('events').EventEmitter;
const config        = require('./config');
const debug         = require('debug')('losant:mqtt');

// Map of transport types to the corresponding url prefixes.
const transportPrefixes = {
  tcp: { prefix: 'mqtt://', port: 1883 },
  tls: { prefix: 'mqtts://', port: 8883 },
  ws: { prefix: 'ws://', port: 80 },
  wss: { prefix: 'wss://', port: 443 }
};

/**
 * MQTT constructor.
 * @return {undefined} undefined
 */
const MQTT = function() {
  EventEmitter.call(this);
  this.client = null;
};

util.inherits(MQTT, EventEmitter);

MQTT.prototype.connect = function(options, callback) {

  // Grab the prefix and port. Default to tls if not provided.
  const prefixPort = transportPrefixes[options.transport] ||
    transportPrefixes.tls;

  const url = prefixPort.prefix + (options.mqttEndpoint || config.mqttEndpoint);

  this.qosPublish = Number(options.qosPublish) > 0 ? 1 : 0;
  callback = callback || function() {};

  debug(`MQTT connecting to ${url}`);

  // Connect to mqtt broker.
  this.client = mqtt.connect(
    url,
    {
      clientId: options.id,
      username: options.key,
      password: options.secret,
      port: options.port || prefixPort.port
    }
  );

  this.client.on('connect', (function() {
    debug(`MQTT successfully connected to ${url}`);
    this.emit('connect');
  }).bind(this));

  let connectComplete = false;

  this.client.once('connect', function() {
    if (!connectComplete) {
      connectComplete = true;
      return callback();
    }
  });

  this.client.once('error', function(err) {
    if (!connectComplete) {
      connectComplete = true;
      return callback(err);
    }
  });

  this.client.on('reconnect', (function() {
    debug(`MQTT reconnecting to ${url}`);
    this.emit('reconnect');
  }).bind(this));

  this.client.on('close', (function() {
    debug(`MQTT disconnected from ${url}`);
    this.emit('close');
  }).bind(this));

  this.client.on('offline', (function() {
    debug(`MQTT offline from ${url}`);
    this.emit('offline');
  }).bind(this));

  this.client.on('error', (function(err) {
    debug(`MQTT error to ${url} ${err}`);
    this.emit('error', err);
  }).bind(this));

  this.client.on('message', (function(topic, message) {
    this.emit('message', topic, message);
  }).bind(this));

  return this;
};

/**
 * Whether or not the underlying mqtt client is connected.
 * @return {Boolean} true if the client is connected
 */
MQTT.prototype.isConnected = function() {
  return this.client ? this.client.connected : false;
};

/**
 * Publishes a message to the underlying mqtt client.
 * @param {String} topic the topic to publish on
 * @param {String} message the message to publish
 * @param {Function} callback a function that will be called when the message is published or errored trying
 * @return {Undefined} undefined
 */
MQTT.prototype.publish = function(topic, message, callback) {
  if (this.client) {
    this.client.publish(topic, message, { qos: this.qosPublish }, callback);
  } else {
    if (callback) { return callback(new Error('Device never connected.')); }
  }
};

/**
 * Subscribes to a topic.
 * @param {String} topic the topic to publish on
 * @param {Function} callback a function that will be called when the subscription completed or errored trying
 * @return {Udefined} undefined
 */
MQTT.prototype.subscribe = function(topic, callback) {
  if (this.client) {
    this.client.subscribe(topic, callback);
  } else {
    if (callback) { return callback(new Error('Device never connected.')); }
  }
};

module.exports = MQTT;
