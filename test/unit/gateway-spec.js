require('should');
var Gateway = require('../../lib/gateway');

describe('Device', function() {
  describe('constructor', function() {
    it('should initialize with empty peripherals', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      gateway.peripherals.length.should.equal(0);
    });
  });

  describe('addPeripheral', function() {
    it('should return added peripheral', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      var peripheral = gateway.addPeripheral('my-peripheral-id');
      peripheral.id.should.equal('my-peripheral-id');
    });

    it('should add peripheral to collection', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      gateway.addPeripheral('my-peripheral-id');
      gateway.peripherals[0].id.should.equal('my-peripheral-id');
    });
  });
});
