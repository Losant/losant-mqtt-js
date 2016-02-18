module.exports = {

  // Format string that takes deviceId for structure mqtt topic for sending device state.
  topicFormatState: process.env.STRUCTURE_TOPIC_FORMAT_STATE || 'structure/%s/state',

  // Format string that takes deviceId for structure mqtt topic for receiving commands.
  topicFormatCommand: process.env.STRUCTURE_TOPIC_FORMAT_MESSAGE || 'structure/%s/command',

  // The structure mqtt endpoint.
  mqttEndpoint: process.env.STRUCTURE_MQTT_ENDPOINT || 'broker.getstructure.io'
};
