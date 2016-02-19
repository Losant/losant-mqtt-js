Structure JavaScript SDK
============

The Structure SDKs provide a simple way for custom things to communicate with the Structure platform. The Structure JavaScript SDK uses the Node.js [MQTT client](https://github.com/mqttjs/MQTT.js) for all underlying communication.

## Installation
The Structure JavaScript SDK is installed using npm.

```
$ npm install structure-sdk-js
```

## Example

Below is a high-level example of using the Structure JavaScript SDK to send the value of a temperature sensor to the Structure platform.

```javascript
var Device = require('structure-sdk-js').Device;

// Construct gateway.
var device = new Device({
  id: 'my-device-id',
  key: 'my-app-access-key',
  secret: 'my-app-access-secret'
});

// Connect to Structure.
device.connect();

// Listen for commands.
device.on('command', function(command) {
  console.log('Command received.');
  console.log(command.name);
  console.log(command.payload);
});

// Send temperature once every second.
setInterval(function() {
  device.sendState({ temperature: readAnalogIn() });
}, 1000);
```


## API Documentation
* [`Device`](#device)
  * [`device.connect()`](#device-connect)
  * [`device.sendState()`](#device-sendstate)
  * [`Event: 'command'`](#device-eventcommand)
  * [`Event: 'connect'`](#device-eventconnect)
  * [`Event: 'reconnect'`](#device-eventreconnect)
  * [`Event: 'close'`](#device-eventclose)
  * [`Event: 'offline'`](#device-eventoffline)
  * [`Event: 'error'`](#device-eventerror)

<a name="device"></a>
## Device
A device represents a single thing or widget that you'd like to connect to the Structure platform. A single device can contain many different sensors or other attached peripherals. Devices can either report state or respond to commands.

A device's state represents a snapshot of the device at some point in time. If the device has a temperature sensor, it might report state every few seconds with the temperature. If a device has a button, it might only report state when the button is pressed. Devices can report state as often as needed by your specific application.

Commands instruct a device to take a specific action. Commands are defined as a name and an optional payload. For example, if the device is a scrolling marquee, the command might be "update text" and the payload would include the text to update.

<a name="device-connect"></a>
### device.connect()

Connects the device to the Structure platform. The device will automatically retry any lost connections. Hook the [connect](#device-eventconnect) event to know when a connection has been successfully established.

```javascript
device.connect();
```

<a name="device-sendstate"></a>
### device.sendState(state, [time], [callback])

Sends a device state to the Structure platform. In many scenarios, device states will change rapidly. For example a GPS device will report GPS coordinates once a second or more. Because of this, sendState is typically the most invoked function. Any state data sent to Structure is stored and made available in data visualization tools and workflow triggers.

```javascript
// Send the device state to Structure.
device.sendState({ voltage: readAnalogIn() });
```

* `state`: The state to send as a JavaScript object.
* `time`: The Date object that the state occurred. Optional. Defaults to `new Date()`.
* `callback`: Invoked when complete. `err` parameter will have details of any errors that occurred. Optional.

<a name="device-eventcommand"></a>
### Event: 'command'

```javascript
device.on('command', function(command) { });
```

Emitted whenever a command is received from the Structure platform.

* `command.name`: The name of the command received.
* `command.time`: The Date of when the command was originally invoked.
* `command.payload`: The optional payload as a JavaScript object for the command.

<a name="device-eventconnect"></a>
### Event: 'connect'

```javascript
device.on('connect', function() { });
```

Emitted by the underlying MQTT client on a successful connection or reconnection.

<a name="device-eventreconnect"></a>
### Event: 'reconnect'

```javascript
device.on('reconnect', function() { });
```

Emitted by the underlying MQTT client whenever a reconnect starts.

<a name="device-eventclose"></a>
### Event: 'close'

```javascript
device.on('close', function() { });
```

Emitted by the underlying MQTT client after a disconnection.

<a name="device-eventoffline"></a>
### Event: 'offline'

```javascript
device.on('offline', function() { });
```

Emitted by the underlying MQTT client when it goes offline.

<a name="device-eventerror"></a>
### Event: 'error'

```javascript
device.on('error', function(err) { });
```

Emitted by the underlying MQTT client when it cannot connect.

* `err`: The error that occurred.

Copyright (c) 2016 Structure
https://getstructure.io
