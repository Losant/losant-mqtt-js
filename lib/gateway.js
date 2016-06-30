var util = require('util');
var Device = require('./device');
var Peripheral = require('./peripheral');
var debug = require('debug')('losant:gateway');

var Gateway = function(options) {
  Device.call(this, options);

  this.peripherals = [];
};

Gateway.prototype.addPeripheral = function(deviceId) {
  debug('Adding peripheral to gateway: ' + deviceId);
  var peripheral = new Peripheral({ id: deviceId, mqtt: this.mqtt });
  this.peripherals.push(peripheral);
  return peripheral;
};

util.inherits(Gateway, Device);

module.exports = Gateway;
