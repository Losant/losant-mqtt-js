// This examples uses two gateways and devices to demonstrate
// sending messages between gateways. Typically these gateways would
// run on two separate physical things, like Intel Edisons or Raspberry PIs.

var async = require('async');
var Structure = require('../index');

// Gateway A.
var gatewayA = Structure.gateway({
  key: 'my-project-key',
  secret: 'my-project-secret',
  gatewayId: 'gateway-id-a',
  deviceIds: [ 'device-id-a' ],
  transport: 'tls'
});

// Gateway B.
var gatewayB = Structure.gateway({
  key: 'my-project-key',
  secret: 'my-project-secret',
  gatewayId: 'gate-id-b',
  deviceIds: [ 'device-id-b' ],
  transport: 'tls'
});

// Send messages to each other.
var sendMessages = function() {

  // Receieve messages sent to device ID "device-id-a".
  gatewayA.devices['device-id-a'].receiveMessage(function(msg) {
    console.log(msg);
  });

  // Receive messages sent to device id "device-id-b".
  gatewayB.devices['device-id-b'].receiveMessage(function(msg) {
    console.log(msg);
  });

  // Send a message to device B from gateway A. Device B is not attached
  // to gateway A, so this message will go through the cloud platform.
  gatewayA.sendMessage('device-id-b', 'Hello B, from gateway A.');

  // Send a message to device A from gateway B.
  gatewayB.sendMessage('device-id-a', 'Hello A, from gateway B.');
};

// Connect the two gateways to Structure.
async.series([ gatewayA.connect, gatewayB.connect ], function(err) {
  if(err) {
    console.log(err);
    process.exit(1);
  }

  sendMessages();
});
