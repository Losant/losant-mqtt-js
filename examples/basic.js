/**
 * Basic example showing how to use the Structure JavaScript SDK.
 * This example does not have any board specific logic. Please refer to
 * the other examples for further details.
 *
 * Copyright (c) 2016 Structure. All rights reserved.
 * http://www.getstructure.io
 */

var Device = require('structure-sdk-js').Device;

// Create a device instance and connect it to Structure.
var device = new Device({
  id: 'my-device-id',
  key: 'my-access-key',
  secret: 'my-access-secret'
}).connect();

// Subscribe to command messages from Structure.
device.on('command', function(command) {
  console.log(command);
});

// Send state to Structure every 5 seconds.
setInterval(function() {

  // Generate a fake temperature between 70 and 75.
  // Typically this would come from some sensor.
  var temp = (Math.random() * 5) + 70;

  // Send the state to Structure.
  device.sendState({ temp: temp });

}, 5000);
