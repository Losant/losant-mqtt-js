/**
 * Basic example of connecting to the Structure platform.
 *
 * Copyright (c) 2016 Structure. All rights reserved.
 * http://www.losant.com
 */

var Device = require('losant-sdk-js').Device;

// Construct a device instance.
var device = new Device({
  id: 'my-device-id',
  key: 'my-access-key',
  secret: 'my-access-secret'
});

// Connect device to Structure.
device.connect();


// Attach event listener for commmands.
device.on('command', function(command) {
  console.log(command.name);
  console.log(command.payload);
});

// Once a second, report state to Structure.
setInterval(function() {

  // Report state to Structure.
  if(device.isConnected()) {
    device.sendState({ key: 'value' });
  }

}, 1000);
