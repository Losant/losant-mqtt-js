var util    = require('util');
var Device  = require('./device');

function Peripheral(options) {
  Device.call(this, options);

  this.gateway = options.gateway;
}

util.inherits(Peripheral, Device);

module.exports = Peripheral;
