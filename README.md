Structure JavaScript SDK
============

The Structure SDKs provide a simple way for custom things to communicate with the Structure platform. The Structure JavaScript SDK uses the Node.js [MQTT client](https://github.com/mqttjs/MQTT.js) for all underlying communication.

## Installation
The Structure JavaScript SDK is installed using npm.

```
$ npm install structure-sdk-js
```

## Example

Below is a high-level example of using the Structure JavaScript SDK to send the value of a temperature sensor to Structure platform.

```javascript
var Structure = require('structure-sdk-js');

// Construct gateway.
var gateway = Structure.gateway({
  key: 'my-app-access-key',
  secret: 'my-app-access-secret',
  gatewayId: 'my-gateway-id'
});

// Attach sensors.
var temperatureDevice = gateway.attachDevice('my-device-id');

// Connect to Structure.
gateway.connect();

// Send temperature once every second.
setInterval(function() {
  temperatureDevice.sendState({ temperature: readAnalogIn() });
}, 1000);
```


## API Documentation
* [`Gateway`](#gateway)
  * [`gateway.attachDevice()`](#gateway-attachdevice)
  * [`gateway.getDevice()`](#gateway-getdevice)
  * [`gateway.connect()`](#gateway-connect)
  * [`gateway.receiveState()`](#gateway-receivestate)
  * [`gateway.sendStateChangeRequest()`](#gateway-sendstatechangerequest)
  * [`gateway.sendMessage()`](#gateway-sendmessage)
  * [`Event: 'connect'`](#gateway-eventconnect)
  * [`Event: 'reconnect'`](#gateway-eventreconnect)
  * [`Event: 'close'`](#gateway-eventclose)
  * [`Event: 'offline'`](#gateway-eventoffline)
  * [`Event: 'error'`](#gateway-eventerror)
* [`Device`](#device)
  * [`device.sendState()`](#device-sendstate)
  * [`device.receiveStateChangeRequest()`](#device-receivestatechangerequest)
  * [`device.receiveMessage()`](#device-receivemessage)

## Gateway

In Structure, a gateway is the thing that is communicating with the Structure platform. Typically code using this SDK is running on a gateway, e.g. Raspberry PI, Intel Edison, etc.

<a name="gateway"></a>
### Structure.gateway(options)

Constructs a new instance of a Structure gateway.

```javascript
var Structure = require('structure-sdk-js');

/**
 * Construct a gateway object and provide it the your application
 * security tokens, gateway id, and the ids of attached devices.
 */
var gateway = Structure.gateway({
  key: 'my-app-access-key',
  secret: 'my-app-access-secret',
  gatewayId: 'my-gateway-id',
  transport: 'tls'
});

gateway.connect();

gateway.on('connect', function() {

});
```

* `key`: The application-specific access key. These are created and managed using the Structure dashboard.
* `secret`: The application-specific access secret. These are created and managed using the Structure dashboard.
* `gatewayId`: The id of this gateway. In order to obtain a gateway id, it must first be registered with the Structure platform.
* `transport`: (optional, defaults to `tls`) The communication transport to use. The valid options are:
  * `tls`: Encrypted tcp communication over port 8883.
  * `tcp` Unencrypted tcp communication over port 1883.
  * `wss` Encrypted WebSocket communication over port 443.
  * `ws` Unencrypted WebSocket communication over port 80.

<a name="gateway-attachdevice"></a>
### gateway.attachDevice(deviceId)

Attaches a [device](#device) to this gateway and returns the device object. Typically developers will not construct device objects directly, but will instead use this function. In Structure, devices are typically sensors or other instruments connected to a gateway. For example, the gateway might be a Raspberry PI and a device you attach might be a temperature sensor. `attachDevice` can be called at any time after the gateway is constructed, allowing devices to be dynamically attached and detached at runtime.

```javascript
  var myDeviceA = gateway.attachDevice('my-device-id-A');
  var myDeviceB = gateway.attachDevice('my-device-id-B');
```

* `deviceId`: The id of the device to attach. If the same id is attached multiple times, the same device object will be returned.

<a name="gateway-getdevice"></a>
### gateway.getDevice(deviceId)

Gets a device that has already been [attached](#gateway-attachdevice) to the gateway. If the device id has not yet been attached, undefined will be returned.

```javascript
var myDeviceA = gateway.getDevice('my-device-id-A');
```

* `deviceId`: The id of the device to get.

<a name="gateway-connect"></a>
### gateway.connect()

Connects the gateway to the Structure platform. The gateway will retry failed connections. Hook the `connect` event to know when a connection has been successfully established.

```javascript
gateway.connect();
```

<a name="gateway-receivestate"></a>
### gateway.receiveState(deviceId, callback)

Subscribes to device state changes that occur for remote devices.

```javascript
gateway.receiveState('my-remote-device-id', function(state) {

});
```

* `deviceId`: The id of the remote device. The device can be any device registered for this application. Typically devices attached to this gateway will not use this function because the device state is already known locally.
* `callback`: Invoked whenever the state of the remote device changes. The state is passed to the callback in the following format:
  * `state.time`: The JavaScript Date object of when the state changed.
  * `state.data`: The key-value pairs of device attributes. e.g. `{ "voltage" : 3.4 }`.

<a name="gateway-sendstatechangerequest"></a>
### gateway.sendStateChangeRequest(deviceId, state, callback)

Sends a state change request for a remote device. If the device is attached to another gateway it will be received by the remote `device.receiveStateChangeRequest` handler. It's up the remote gateway and how it communicates with the device to properly handle the request.

```javascript
gateway.sendStateChangeRequest('my-remote-device-id', { voltage: 3.2 }, function(err) {

});
```

* `deviceId`: The id of the device. If a remote gateway has this device id attached and has subscribed to `device.receiveStateChangeRequest` it will be sent by Structure to that gateway.
* `state`: The state to request. The state is a JavaScript object with keys and values. e.g. `{ voltage: 3.2 }`.
* `callback`: Invoked when complete. The `err` parameter will include any errors.

<a name="gateway-sendmessage"></a>
### gateway.sendMessage(deviceId, message, callback)

Sends a message for a remove device. The message type must be a string and it can contain any arbitrary information. The message will be received by a remote gateway that has the specified deviceId attached and `device.receiveMessage` subscribed.

```javascript
gateway.sendMessage('my-remote-device-id', 'Random text', function(err) {

});
```

* `deviceId`: The id of the device. The message will be received by the remote gateway that has this id attached and is subscribed to `device.receiveMessage`.
* `message`: The message to send. The message type must be a string and it can contain any arbitrary text.
* `callback`: Invoked when complete. The `err` parameter will contain any errors that occurred.

<a name="gateway-eventconnect"></a>
### Event: 'connect'

```javascript
function() { }
```

Emitted by the underlying MQTT client on a successful connection or reconnection.

<a name="gateway-eventreconnect"></a>
### Event: 'reconnect'

```javascript
function() { }
```

Emitted by the underlying MQTT client whenever a reconnect starts.

<a name="gateway-eventclose"></a>
### Event: 'close'

```javascript
function() { }
```

Emitted by the underlying MQTT client after a disconnection.

<a name="gateway-eventoffline"></a>
### Event: 'offline'

```javascript
function() { }
```

Emitted by the underlying MQTT client when it goes offline.

<a name="gateway-eventerror"></a>
### Event: 'error'

```javascript
function(err) { }
```

Emitted by the underlying MQTT client when it cannot connect.

* `err`: The error that occurred.

<a name="device"></a>
## Devices

In Structure, devices are typically sensors or other instruments connected to a gateway. For example a gateway could be a Raspberry PI and a device could be a temperature sensor attached to some of the Raspberry PI's GPIO pins. Code that uses this SDK is typically run on a gateway and it's usually up to the gateway to know how to read a devices state. Device objects are constructed by calling [`gateway.attachDevice`](#gateway-attachdevice). Typically developers will not construct these directly.

<a name="device-sendstate"></a>
### device.sendState(state, callback)

Sends a device state to the Structure platform. In many scenarios, device states will change rapidly. For example a GPS device will report GPS coordinates once a second or more. Because of this, sendState is typically the most invoked function. Any state data sent to Structure is stored and made available in data visualization tools and workflow triggers.

```javascript
// Get the device object.
var myDeviceA = gateway.devices['my-device-id-A'];

// Send the device state to Structure.
myDeviceA.sendState({ voltage: readAnalogIn() }, function(err) {

});
```

* `state`: The state to send in the form of a JavaScript object.
* `callback`: Invoked when complete. `err` parameter will have details of any errors that occurred.

<a name="device-receivestatechangerequest"></a>
### device.receiveStateChangeRequest(callback)

Invoked whenever a state change request is made for this device.

```javascript
device.receiveStateChangeRequest(function(state) {

  // The new state is on the data property.
  setAnalogOut(state.data.voltage);
});
```

* `callback`: Invoked when a state change request occurs. `state` parameter is the requested state.

<a name="device-receivemessage"></a>
### device.receiveMessage(callback)

Invoked whenever a message is sent for this device. Messages are arbitrary strings and developers can choose to send any information they choose.

```javascript
device.receiveMessage(function(msg) {

});
```

* `callback`: Invoked when a message is received for this device. The `msg` parameter will be a string. It is up to the developer to properly decode the message as needed.

##License

The MIT License (MIT)

Copyright (c) 2015 Structure

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
