module.exports = {

  // Format string that takes deviceId for losant mqtt topic for sending device state.
  topicFormatState: process.env.LOSANT_TOPIC_FORMAT_STATE || 'losant/%s/state',

  // Format string that takes deviceId for losant mqtt topic for receiving commands.
  topicFormatCommand: process.env.LOSANT_TOPIC_FORMAT_MESSAGE || 'losant/%s/command',

  // The losant mqtt endpoint.
  mqttEndpoint: process.env.LOSANT_MQTT_ENDPOINT || 'broker.losant.com'
};
