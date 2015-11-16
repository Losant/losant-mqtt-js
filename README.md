Structure JavaScript SDK
============

The Structure SDKs provide a simple way for your custom devices to communicate with the Structure platform. The Structure JavaScript SDK is a wrapper and abstraction layer around the Node.js [MQTT client](https://github.com/mqttjs/MQTT.js). Please see the full [Structure documentation](http://getstructure.io/docs) for more details.

## Installation
The Structure JavaScript SDK is installed using npm.

```text
$ npm install structure-sdk-js
```

## API Documentation
* [`Structure.gateway()`](#gateway)
* [`Structure.gateway#devices`](#gateway-devices)
* [`Structure.gateway#connect()`](#gateway-connect)
* [`Structure.gateway#receiveState()`](#gateway-receivestate)
* [`Structure.gateway#sendStateChangeRequest()`](#gateway-sendstatechangerequest)
* [`Structure.gateway#sendMessage()`](#gateway-sendmessage)
* [`Structure.device()`](#device)
* [`Structure.device#sendState()`](#device-sendstate)
* [`Structure.device#receiveStateChangeRequest()`](#device-receivestatechangerequest)
* [`Structure.device#receiveMessage()`](#device-receivemessage)

## Gateway

In Structure, a gateway is the thing that is communicating directly with the Structure platform. Typically the code that is using this SDK is running on a Gateway, for example a Raspberry PI or Intel Edison.

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
  deviceIds: [ 'my-device-id-A', 'my-device-id-B' ],
  transport: 'tls'
});
```

* `key`: The application-specific access key. These are created and managed using the Structure dashboard.
* `secret`: The application-specific access secret. These are created and managed using the Structure dashboard.
* `gatewayId`: The id of this gateway. In order to obtain a Gateway id, it must first be registered with the Structure platform.
* `deviceIds`: (optional) The array of device ids that are attached to this gateway. In order to obtain device ids they must first be registered with the Structure platform.
* `transport`: (optional, defaults to `tls`) The communication transport to use. The valid options are:
  * `tls`: Encrypted tcp communication over port 8883.
  * `tcp` Unencrypted tcp communication over port 1883.
  * `wss` Encrypted WebSocket communication over port 443.
  * `ws` Unencrypted WebSocket communication over port 80.

<a name="gateway-devices"></a>
### gateway.devices
  Collection of [device](#device) objects attached to the gateway. When a gateway is constructed it will automatically construct the required device objects based on the `deviceIds` parameter. Typically developers will not construct device objects directly.

```javascript
  var myDeviceA = gateway.devices['my-device-id-A'];
  var myDeviceB = gateway.devices['my-device-id-B'];
```

<a name="gateway-connect"></a>
### gateway.connect(callback)

Connects the gateway to the Structure platform.

```javascript
gateway.connect(function(err) {

});
```

* `callback`: Invoked when the connection is complete or it failed. The `err` parameter will includes details of the error.

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

<a name="device"></a>
## Devices

In Structure, devices are typically sensors or other instruments connected to a gateway. For example a gateway could be a Raspberry PI and a device could be a temperature sensor attached to some of the Raspberry PI's GPIO pins. Code that uses this SDK is typically run on a gateway and it's usually up to the gateway to know how to read a devices state. The Structure SDK will automatically create device objects when the gateway is constructed. They are available on the `gateway.devices` property. Typically developers will not directly construct device objects.

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
