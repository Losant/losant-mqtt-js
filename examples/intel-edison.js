/**
 * Example demonstrating how to collect temperature data
 * and report it to the Losant IoT developer platform.
 *
 * This example assumes the Edison is attached to the
 * Arduino Breakout board with the following connections.
 *
 * LED connected to GPIO pin 7.
 * TMP36 temperature sensor connected to analog input A0.
 *
 * Copyright (c) 2016 Losant. All rights reserved.
 * http://www.losant.com
 */

var mraa = require('mraa');
var Device = require('losant-mqtt').Device;

// Reading temperature from analog input.
var temp = new mraa.Aio(0);

// Blinking an LED everytime temperature is read.
var led = new mraa.Gpio(7);
led.dir(mraa.DIR_OUT);

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


// Once a second, read the temp and report to Losant.
setInterval(function() {

  // Turn on the LED.
  led.write(1);

  // Read temp voltage and convert.
  var tempRaw = temp.read();
  var degreesC = (((tempRaw / 1024) * 5) - 0.52) * 100;
  var degreesF = degreesC * 1.8 + 32;

  console.log(degreesC);
  console.log(degreesF);

  // Report state to Losant.
  device.sendState({ temp: degreesF });

  // Wait a little and turn off the LED.
  setTimeout(function() { led.write(0); }, 500);

}, 1000);
