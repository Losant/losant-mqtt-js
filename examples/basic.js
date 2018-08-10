/**
 * Basic example of connecting to the Losant platform.
 *
 * Copyright (c) 2018 Losant IoT, Inc. All rights reserved.
 * https://www.losant.com
 *
 */

/* eslint no-console: "off"*/

var Device = require('losant-mqtt').Device;

// Construct a device instance.
var device = new Device({
  id: 'my-device-id',
  key: 'my-access-key',
  secret: 'my-access-secret'
});

// Connect device to Losant.
device.connect();


// Attach event listener for commands.
device.on('command', function(command) {
  console.log(command.name);
  console.log(command.payload);
});

// Once a second, report state to Losant.
setInterval(function() {

  // Report state to Losant.
  if(device.isConnected()) {
    device.sendState({ key: 'value' });
  }

}, 1000);
