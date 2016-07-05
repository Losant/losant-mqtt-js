var util    = require('util');
var Device  = require('./device');

function Peripheral(options) {
  Device.call(this, options);
}

util.inherits(Peripheral, Device);

module.exports = Peripheral;
