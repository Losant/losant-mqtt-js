// This examples uses two devices and demonstrates how to send arbitrary
// messages between them.
var Device = require('../index').Device;

var deviceA = new Device({
  id: 'device-id-a',
  key: 'application-key',
  secret: 'application-secret',
});

var deviceB = new Device({
  id: 'device-id-b',
  key: 'application-key',
  secret: 'application-secret',
});

deviceA.connect();
deviceB.connect();

// Receive messages sent to device a.
deviceA.receiveMessage(function(msg) {
  console.log(msg);
});

// Receive messages sent to device b.
deviceB.receiveMessage(function(msg) {
  console.log(msg);
});

// Send messages to each other.
var sendMessages = function() {

  // Send a message to device B from device A.
  deviceA.sendMessage('device-id-b', 'Hello B, from Device A.');

  // Send a message to device A from device B.
  deviceB.sendMessage('device-id-a', 'Hello A, from Device B.');
};

setInterval(function() {
  sendMessages();
}, 2000);
