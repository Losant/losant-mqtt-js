/**
 * Constructs a structure device object.
 * options:
 * - id: the device ID.
 * - gateway: the structure gateway.
 */
module.exports = function(options) {

  var gateway = options.gateway;

  var device = {
    id: options.id
  };

  /**
   * Sends the state of this device to structure.
   * state: the state of the device. Typically { attribute: value }
   * cb: the callback handling the response.
   */
  device.sendState = function(state, cb) {
    gateway.sendDeviceState(device.id, state, cb);
  };

  /**
   * Receives state change events from structure.
   * cb: the callback handling the response.
   */
  device.receiveStateChangeRequest = function(cb) {
    gateway.receiveStateChangeRequest(device.id, cb);
  };

  /**
   * Receives messages from structure.
   * cb: the callback handling the response.
   */
  device.receiveMessage = function(cb) {
    gateway.receiveMessage(device.id, cb);
  };

  return device;
};
