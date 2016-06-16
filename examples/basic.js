/**
 * Basic example of connecting to the Losant platform.
 *
 * Copyright (c) 2016 Losant. All rights reserved.
 * http://www.losant.com
 */

var Device = require('losant-mqtt').Device;

// Construct a device instance.
var device = Device({
  id: 'my-device-id',
  key: 'my-access-key',
  secret: 'my-access-secret'
});

// Connect device to Losant.
device.connect();


// Attach event listener for commmands.
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
