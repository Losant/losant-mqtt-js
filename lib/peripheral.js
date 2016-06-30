var util    = require('util');
var Device  = require('./device');

var Peripheral = function(options) {
  Device.call(this, options);
};

util.inherits(Peripheral, Device);

module.exports = Peripheral;
