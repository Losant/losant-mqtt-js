require('should');
var Gateway = require('../../lib/gateway');

describe('Device', function() {

  describe('addPeripheral', function() {
    it('should return added peripheral', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      var peripheral = gateway.addPeripheral('my-peripheral-id');
      peripheral.id.should.equal('my-peripheral-id');
    });

    it('should add peripheral to collection', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      var peripheral = gateway.addPeripheral('my-peripheral-id');
      gateway.peripherals['my-peripheral-id'].should.equal(peripheral);
    });

    it('should return same peripheral if added twice', function() {
      var gateway = new Gateway({ id: 'my-device-id' });
      var peripheralA = gateway.addPeripheral('peripheralA');
      var peripheralB = gateway.addPeripheral('peripheralA');
      peripheralA.should.equal(peripheralB);
    });
  });
});
