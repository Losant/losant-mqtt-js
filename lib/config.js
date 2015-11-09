module.exports = {

  // Prefix applied to all structure specific mqtt topics.
  topicPrefix: process.env.STRUCTURE_TOPIC_PREFIX || 'structure',

  // Format string that takes deviceId for structure mqtt topic for sending device state.
  topicFormatState: process.env.STRUCTURE_TOPIC_FORMAT_STATE || 'structure/%s/state',

  // Format string that takes deviceId for structure mqtt topic for sending messages.
  topicFormatMessage: process.env.STRUCTURE_TOPIC_FORMAT_MESSAGE || 'structure/%s/message',

  // The structure-specific topic family for state messages.
  topicFamilyState: process.env.STRUCTURE_TOPIC_FAMILY_STATE || 'state',

  // The structure-specific topic family for message mssages.
  topicFamilyMessage: process.env.STRUCTURE_TOPIC_FAMILY_MESSAGE || 'message',

  // The structure mqtt endpoint.
  mqttEndpoint: process.env.STRUCTURE_MQTT_ENDPOINT || 'broker.getstructure.io',

  // The type string that indicates the message is device state.
  messageTypeState: process.env.STRUCTURE_MSG_TYPE_STATE || 'state',

  // The type string that indicates the message is a message and not device state.
  messageTypeMsg: process.env.STRUCTURE_MSG_TYPE_MSG || 'msg'
};
