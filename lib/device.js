var events  = require('events');
var util    = require('util');
var mqtt    = require('mqtt');
var debug   = require('debug')('structure-sdk-js');
var EJSON   = require('mongodb-extended-json');
var config  = require('./config');

// Map of transport types to the corresponding url prefixes.
const transportPrefixes = {
  'tcp': { prefix: 'mqtt://', port: 1883 },
  'tls': { prefix: 'mqtts://', port: 8883 },
  'ws': { prefix: 'ws://', port: 80 },
  'wss': {prefix: 'wss://', port: 443 }
};

module.exports = function(options) {

  // Default the options and remove whitespace.
  options.id = (options.id || '').replace(/ /g, '');
  options.key = (options.key || '').replace(/ /g, '');
  options.secret = (options.secret || '').replace(/ /g, '');

  var device = new events.EventEmitter();
  device.id = options.id;

  var mqttClient = null;

  // Map of { 'topic': [] } to keep track of which handlers are associated
  // with what mqtt subscriptions.
  var receiveStateHandlers = {};
  var receiveStateChangeRequestHandlers = {};
  var receiveMessageHandlers = {};

  // Map of { 'topic' : true } for all subscribed topics. Prevents duplicates
  // subscriptions.
  var subscribedTopics = {};

  /**
   * Connects to the Structure platform.
   */
  device.connect = function() {
    // Grab the prefix and port. Default to tls if not provided.
    var prefixPort = transportPrefixes[options.transport] ||
      transportPrefixes.tls;

    var url = prefixPort.prefix + config.mqttEndpoint;

    debug('MQTT connecting to ' + url);

    // Connect to mqtt broker.
    mqttClient = mqtt.connect(
      url, { clientId: options.id,
        username: options.key,
        password: options.secret,
        port: prefixPort.port });

    mqttClient.on('connect', function(connack) {
      debug('MQTT successfully connected to ' + url);

      // Resubscribe to all topics.
      Object.keys(subscribedTopics).forEach(function(topic) {
        subscribedTopics[topic] = false;
        subscribeToMqttTopic(topic);
      });

      device.emit('connect', connack);
    });

    mqttClient.on('reconnect', function() {
      debug('MQTT reconnecting to ' + url);
      device.emit('reconnect');
    });

    mqttClient.on('close', function() {
      debug('MQTT disconnected from ' + url);
      device.emit('close');
    });

    mqttClient.on('offline', function() {
      debug('MQTT offline from ' + url);
      device.emit('offline');
    });

    mqttClient.on('error', function(err) {
      debug('MQTT error to ' + url + ' ' + err.toString());
      device.emit('error', err);
    });

    mqttClient.on('message', handleMessage);
  };

  /**
   * Subscribes to the specified mqtt topic.
   * topic - the topic to subscribe to.
   */
  var subscribeToMqttTopic = function(topic) {
    debug('Subscribing to MQTT topic ' + topic);

    if(!subscribedTopics[topic]) {
      subscribedTopics[topic] = true;

      // Client hasn't been connected yet. Skip the actual subscribe.
      // All topics will be automatically subscribed when the client
      // does connect.
      if(mqttClient) {
        mqttClient.subscribe(topic);
      }
    }
  };

  /**
   * Handles a message sent from the Structure broker.
   * topic: the mqtt topic.
   * message: the message as a Buffer.
   * Returns null if message is invalid. Returns the parsed JavaScript
   * object if the message is valid.
   */
  var handleMessage = function(topic, message) {

    debug('Received MQTT message on topic ' + topic);

    // This is not a structure-specific message, nothing to do.
    if(topic.indexOf(config.topicPrefix) !== 0) {
      return null;
    }

    message = parseMessage(message);
    if(!message) {
      return null;
    }

    debug('Received MQTT message ' + JSON.stringify(message));

    // Attempt to extract deviceId from topic.
    // Format is /structure/deviceId/...
    var deviceId;
    try {
      deviceId = topic.split('/')[1];
      if(!deviceId) { throw new Error(); }
    }
    catch(e) {
      debug('Failed to find device id in topic.');
      return null;
    }

    // Attempt to extract topic family: /state || /message.
    // Format is /structure/deviceId/family.
    var topicFamily;
    try {
      topicFamily = topic.split('/')[2];
      if(!topicFamily) { throw new Error(); }
    }
    catch(e) {
      debug('Failed to find topic family.');
      return null;
    }

    if(topicFamily === config.topicFamilyState) {
      handleStateMessage(topic, message);
    }
    else if(topicFamily === config.topicFamilyMessage) {
      handleMessageMessage(topic, message);
    }
    else {
      debug('Unknown topic family: ' + topicFamily);
      return null;
    }

    return message;
  };

  /**
   * Parses an incoming mqtt message from the Structure broker..
   * Returns an object or null.
   * message: the incoming Buffer to parse and validate.
   */
  var parseMessage = function(message) {

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
   * Handles a state topic family message.
   * topic: the raw topic.
   * message: the parsed message object.
   */
  var handleStateMessage = function(topic, message) {

    // Invoke the correct handlers.
    // These are added to this object during gateway.receiveState.
    if(receiveStateHandlers[topic]) {
      receiveStateHandlers[topic].forEach(function(handler) {
        handler(message);
      });
    }
  };

  /**
   * Handles a message topic family message. These will include
   * state change requests and arbitrary messages.
   * topic: the mqtt topic.
   * message: the parsed message.
   */
  var handleMessageMessage = function(topic, message) {

    // Malformed message, skipping.
    if(!message.payload) { return; }

    // This is a state change request.
    if(message.type === config.messageTypeState) {

      // Invoke all state change request handlers.
      if(receiveStateChangeRequestHandlers[topic]) {
        receiveStateChangeRequestHandlers[topic].forEach(function(handler) {
          handler(message.payload);
        });
      }
    }

    // This is an arbitrary message.
    if(message.type === config.messageTypeMsg) {

      // Invoke all message handlers.
      if(receiveMessageHandlers[topic]) {
        receiveMessageHandlers[topic].forEach(function(handler) {
          handler(message.payload);
        });
      }
    }
  };

  /**
   * Sends device state to Structure.
   * state: the state to send. Typically an object with { attribute: value }
   * cb: the callback handling the response.
   */
  device.sendState = function(state, cb) {
    var topic = util.format(config.topicFormatState, device.id);
    var payload = { time: new Date(), data: state };

    // May not be connected. Skip publish if not.
    if(mqttClient) {
      mqttClient.publish(topic, EJSON.stringify(payload), cb);
    }
  };

  /**
   * Sends a state change request to a different device.
   * deviceId: the device id.
   * state: the requested state.
   * cb: the callback handling the response.
   */
  device.sendStateChangeRequest = function(deviceId, state, cb) {
    var topic = util.format(config.topicFormatMessage, deviceId);
    var payload = {
      type: 'state',
      payload: { time: new Date(), data: state }
    };

    if(mqttClient) {
      mqttClient.publish(topic, EJSON.stringify(payload), cb);
    }
  };

  /**
   * Sends a message to another device.
   * deviceId: the device id.
   * message: the string to send.
   * cb: the callback handling the response.
   */
  device.sendMessage = function(deviceId, message, cb) {

    cb = cb || function() { };

    if(typeof message !== 'string') {
      setImmediate(cb(new Error('message must be a string')));
      return;
    }

    var topic = util.format(config.topicFormatMessage, deviceId);
    var payload = {
      type: 'msg',
      payload: message
    };

    if(mqttClient) {
      mqttClient.publish(topic, EJSON.stringify(payload), cb);
    }
  };

  /**
   * Receives state from another device.
   * deviceId: the device id.
   * cb: the callback handling the response.
   */
  device.receiveState = function(deviceId, cb) {
    var topic = util.format(config.topicFormatState, deviceId);

    // Add handler for this topic.
    if(!receiveStateHandlers[topic]) {
      receiveStateHandlers[topic] = [];
    }

    receiveStateHandlers[topic].push(cb);

    subscribeToMqttTopic(topic);
  };

  /**
   * Subscribes to state changes requests for devices.
   * cb: callback handling the response.
   */
  device.receiveStateChangeRequest = function(cb) {
    var topic = util.format(config.topicFormatMessage, device.id);

    if(!receiveStateChangeRequestHandlers[topic]) {
      receiveStateChangeRequestHandlers[topic] = [];
    }
    receiveStateChangeRequestHandlers[topic].push(cb);

    subscribeToMqttTopic(topic);
  };

  /**
   * Subscribes to messages for this device.
   * cb: callback handling the response.
   */
  device.receiveMessage = function(cb) {
    var topic = util.format(config.topicFormatMessage, device.id);

    if(!receiveMessageHandlers[topic]) {
      receiveMessageHandlers[topic] = [];
    }
    receiveMessageHandlers[topic].push(cb);

    subscribeToMqttTopic(topic);
  };

  // Exposed for testability.
  device._mqttClient = mqttClient;
  device._subscribeToMqttTopic = subscribeToMqttTopic;
  device._handleMessage = handleMessage;
  device._parseMessage = parseMessage;
  device._handleStateMessage = handleStateMessage;

  return device;
};
