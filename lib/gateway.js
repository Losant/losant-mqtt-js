var util = require('util');
var Device = require('./device');
var Peripheral = require('./peripheral');
var debug = require('debug')('losant:gateway');

function Gateway(options) {
  Device.call(this, options);

  this.peripherals = {};
}

util.inherits(Gateway, Device);

Gateway.prototype.addPeripheral = function(deviceId) {

  if(this.peripherals[deviceId]) {
    return this.peripherals[deviceId];
  }

  debug('Adding peripheral to gateway: ' + deviceId);
  var peripheral = new Peripheral({ id: deviceId, mqtt: this.mqtt, gateway: this });
  this.peripherals[deviceId] = peripheral;

  return peripheral;
};

module.exports = Gateway;
