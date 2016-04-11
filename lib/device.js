var events  = require('events');
var util    = require('util');
var mqtt    = require('mqtt');
var debug   = require('debug')('losant-sdk-js');
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

  // Check required fields.
  if(!options || !options.id) {
    throw new Error('ID is required.');
  }

  // Default the options and remove whitespace.
  options.id = (options.id || '').replace(/ /g, '');
  options.key = (options.key || '').replace(/ /g, '');
  options.secret = (options.secret || '').replace(/ /g, '');

  // The MQTT topics that this device will use.
  var commandTopic = util.format(config.topicFormatCommand, options.id);
  var stateTopic = util.format(config.topicFormatState, options.id);

  var device = new events.EventEmitter();
  device.id = options.id;

  var mqttClient = null;

  /**
   * Returns whether or not the device is connected.
   */
  device.isConnected = function() {
    return mqttClient ? mqttClient.connected : false;
  };

  /**
   * Connects to the Losant platform.
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

    // Exposed for testability.
    device._mqttClient = mqttClient;

    mqttClient.on('connect', function(connack) {
      debug('MQTT successfully connected to ' + url);

      // Subscribe to command topic.
      subscribeToMqttTopic(commandTopic);

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

    return device;
  };

  /**
   * Subscribes to the specified mqtt topic.
   * topic - the topic to subscribe to.
   */
  var subscribeToMqttTopic = function(topic) {
    debug('Subscribing to MQTT topic ' + topic);

    // Client hasn't been connected yet. Skip the actual subscribe.
    // All topics will be automatically subscribed when the client
    // does connect.
    if(mqttClient) {
      mqttClient.subscribe(topic);
    }
  };

  /**
   * Handles a message sent from the Losant broker.
   * topic: the mqtt topic.
   * message: the message as a Buffer.
   * Returns null if message is invalid. Returns the parsed JavaScript
   * object if the message is valid.
   */
  var handleMessage = function(topic, message) {

    debug('Received MQTT message on topic ' + topic);

    // The only topics this client supports are commands. Something else
    // was sent, so just bail.
    if(topic !== commandTopic) {
      return null;
    }

    message = parseMessage(message);
    if(!message) {
      return null;
    }

    debug('Received MQTT message:');
    debug(JSON.stringify(message));

    device.emit('command', message);

    return message;
  };

  /**
   * Parses an incoming mqtt message from the Losant broker..
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
   * Sends device state to Losant.
   * deviceId: the ID of the device to report state for.
   * state: the state to send. Typically an object with { attribute: value }
   * time (optional): the time at which the state occurred (defaults to now)
   * cb: the callback handling the response.
   */
  device.sendState = function(state, time, callback) {

    if(typeof(time) === 'function') {
      callback = time;
      time = null;
    }

    time = time || new Date();
    var payload = { time: time, data: state };

    debug('Publishing state:');
    debug(EJSON.stringify(payload));

    // May not be connected. Skip publish if not.
    if(mqttClient) {
      mqttClient.publish(stateTopic, EJSON.stringify(payload), callback);
    }
    else {
      if(callback) { callback(null); }
    }

    return { topic: stateTopic, payload: payload };
  };

  return device;
};
