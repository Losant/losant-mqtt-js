var util    = require('util');
var mqtt    = require('mqtt');
var EJSON   = require('mongodb-extended-json');
var config  = require('./config');
var device  = require('./device');

// Map of transport types to the corresponding url prefixes.
const transportPrefixes = {
  'tcp': { prefix: 'mqtt://', port: 1883 },
  'tls': { prefix: 'mqtts://', port: 8883 },
  'ws': { prefix: 'ws://', port: 80 },
  'wss': {prefix: 'wss://', port: 443 }
};

/**
 * Creates an instance of a Structure Gateway.
 * options:
 * - gatewayId: the unique id of the gateway.
 * - deviceIds: array of device ids attached to this gateway.
 * - key: Structure access key.
 * - secret: Structure access secret.
 * - transport: 'tcp', 'tls', 'ws', 'wss'. Defaults to 'tcp'.
 */
module.exports = function(options) {

  // The client for mqtt communications.
  var mqttClient = null;

  // Default the options and remove whitespace.
  options.key = (options.key || '').replace(/ /g, '');
  options.secret = (options.secret || '').replace(/ /g, '');
  options.gatewayId = (options.gatewayId || '').replace(/ /g, '');
  options.deviceIds = options.deviceIds || [];

  var gateway = {
    id: options.gatewayId,
    deviceIds: options.deviceIds,
    devices: {}
  };

  // Map of topic: [] to keep track of which handlers are associated
  // with what mqtt subscriptions.
  var receiveStateHandlers = {};
  var receiveStateChangeRequestHandlers = {};
  var receiveMessageHandlers = {};

  // Map of 'topic' : true for all subscribed topics. Prevents duplicates
  // subscriptions.
  var subscribedTopics = {};

  /**
   * Connects the gateway to Structure.
   * cb: the callback handling the response.
   */
  gateway.connect = function(cb) {

    // Build device wrappers for all attached devices.
    options.deviceIds.forEach(function(deviceId) {
      gateway.devices[deviceId] = device({ id: deviceId, gateway: gateway });
    });

    // Grab the prefix and port. Default to tls if not provided.
    var prefixPort = transportPrefixes[options.transport] ||
      transportPrefixes.tls;

    // Connect to mqtt broker.
    mqttClient = mqtt.connect(
      prefixPort.prefix + config.mqttEndpoint,
      { clientId: gateway.id, username: options.key, password: options.secret, port: prefixPort.port });

    // Used to determine when the connection is complete. Required since
    // mqtt client sends events for 'connect' and 'error' and either one
    // could invoke the supplied callback.
    var doneWithConnection = false;

    mqttClient.on('connect', function() {
      if(!doneWithConnection) {
        doneWithConnection = true;
        cb();
      }
    });

    mqttClient.on('error', function(err) {
      if(!doneWithConnection) {
        doneWithConnection = true;
        cb(err);
      }
    });

    mqttClient.on('message', gateway.handleMessage);
  };

  /**
   * Handles a message sent from Structure broker.
   * topic: the mqtt topic.
   * message: the message as a Buffer.
   */
  gateway.handleMessage = function(topic, message) {

    // This is not a structure-specific message, nothing to do.
    if(topic.indexOf(config.topicPrefix) !== 0) {
      return new Error('Received message from non-structure topic: ' + topic);
    }

    message = gateway.parseMessage(message);
    if(!message) {
      return new Error('Failed to parse message.');
    }

    // Attempt to extract deviceId from topic.
    // Format is /structure/deviceId/...
    var deviceId;
    try {
      deviceId = topic.split('/')[1];
      if(!deviceId) { throw new Error(); }
    }
    catch(e) {
      return new Error('Failed to find device id.');
    }

    // Attempt to extract topic family: /state || /message.
    // Format is /structure/deviceId/family.
    var topicFamily;
    try {
      topicFamily = topic.split('/')[2];
      if(!topicFamily) { throw new Error(); }
    }
    catch(e) {
      return new Error('Failed to find topic family.');
    }

    if(topicFamily === config.topicFamilyState) {
      gateway.handleStateMessage(topic, message);
    }
    else if(topicFamily === config.topicFamilyMessage) {
      gateway.handleMessageMessage(deviceId, topic, message);
    }
    else {
      return new Error('Unknown topic family: ' + topicFamily);
    }
  };

  /**
   * Parses an incoming mqtt message from structure.
   * Returns an object or null.
   * message: the incoming Buffer to validate.
   */
  gateway.parseMessage = function(message) {

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
  gateway.handleStateMessage = function(topic, message) {

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
   * deviceId: the deviceId.
   * topic: the mqtt topic.
   * message: the parsed message.
   */
  gateway.handleMessageMessage = function(deviceId, topic, message) {

    var device = gateway.devices[deviceId];

    // Device is not attached to this gateway, nothing to do.
    if(!device) { return; }

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
   * deviceId: the device ID.
   * state: the state to send. Typically an object with { attribute: value }
   * cb: the callback handling the response.
   */
  gateway.sendDeviceState = function(deviceId, state, cb) {
    var topic = util.format(config.topicFormatState, deviceId);
    var payload = { time: new Date(), attributes: state };

    mqttClient.publish(topic, EJSON.stringify(payload), cb);
  };

  /**
   * Sends a state change request to a device not attached to this gateway.
   * deviceId: the device id.
   * state: the requested state.
   * cb: the callback handling the response.
   */
  gateway.sendStateChangeRequest = function(deviceId, state, cb) {
    var topic = util.format(config.topicFormatMessage, deviceId);
    var payload = {
      type: 'state',
      payload: { time: new Date(), attributes: state }
    };

    mqttClient.publish(topic, EJSON.stringify(payload), cb);
  };

  /**
   * Sends a message about a device not attached to this gateway.
   * deviceId: the device id.
   * message: the string to send.
   * cb: the callback handling the response.
   */
  gateway.sendMessage = function(deviceId, message, cb) {

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

    mqttClient.publish(topic, EJSON.stringify(payload), cb);
  };

  /**
   * Receives state from a device not attached to this gateway.
   * deviceId: the device id.
   * cb: the callback handling the response.
   */
  gateway.receiveState = function(deviceId, cb) {
    var topic = util.format(config.topicFormatState, deviceId);

    // Add handler for this topic.
    if(!receiveStateHandlers[topic]) {
      receiveStateHandlers[topic] = [];
    }

    receiveStateHandlers[topic].push(cb);

    gateway.subscribeToMqttTopic(topic);
  };

  /**
   * Subscribes to state changes requests for devices.
   * deviceId: the device id.
   * cb: callback handling the response.
   */
  gateway.receiveStateChangeRequest = function(deviceId, cb) {
    var topic = util.format(config.topicFormatMessage, deviceId);

    if(!receiveStateChangeRequestHandlers[topic]) {
      receiveStateChangeRequestHandlers[topic] = [];
    }
    receiveStateChangeRequestHandlers[topic].push(cb);

    gateway.subscribeToMqttTopic(topic);
  };

  /**
   * Subscribes to message for devices.
   * deviceId: the device id.
   * cb: callback handling the response.
   */
  gateway.receiveMessage = function(deviceId, cb) {
    var topic = util.format(config.topicFormatMessage, deviceId);

    if(!receiveMessageHandlers[topic]) {
      receiveMessageHandlers[topic] = [];
    }
    receiveMessageHandlers[topic].push(cb);

    gateway.subscribeToMqttTopic(topic);
  };

  /**
   * Subscribes to mqtt topics. Prevents multiple subscriptions to
   * the same topic.
   * topic: the topic to subscribe to.
   */
  gateway.subscribeToMqttTopic = function(topic) {
    if(!subscribedTopics[topic]) {
      subscribedTopics[topic] = true;
      mqttClient.subscribe(topic);
    }
  };

  gateway.attachDevice = function(deviceId) {
    console.log(deviceId);
  };

  gateway.detachDevice = function(deviceId) {
    console.log(deviceId);
  };

  return gateway;
};
