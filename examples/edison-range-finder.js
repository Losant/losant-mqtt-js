// This example reads the value of an analog input, for example an
// ultrasonic range finder, and sends the value to the structure
// platform once per second.

var Structure = require('../index');
var Cylon = require('cylon');


// Initialize the Structure Gateway with your account information.
var gateway = Structure.gateway({
  key: 'my-structure-key',
  secret: 'my-structure-secret',
  gatewayId: 'my-structure-gateway-id',
  deviceIds: [ 'my-device-id' ]
});

// This example uses the Cylon module to interface with the Edison hardware.
// This example is assuming an analog input is plugged in to pin A0.
var robot = Cylon.robot({

  connections: {
    edison: { adaptor: 'intel-iot' }
  },

  devices: {
    range: { driver: 'analog-sensor', pin: 0 }, // range sensor plugged into A0.
  },

  work: function(my) {

    // Get the device object from the gateway.
    var range = gateway.devices['my-device-id'];

    // Ready the analog value from the edison and send it to structure.
    // Structure receives state information as an object with attributes
    // and values. In this example, the attribute is named 'value'.
    every((1).second(), function() { 
      range.sendState({ value: my.range.analogRead()}) 
    });
  }
});

// Connect the gateway to Structure and start cylon when it succeeds.
gateway.connect(function(err) {
  if(err) {
    console.log(err);
    process.exit(1);
  }

  robot.start();
});