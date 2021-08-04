require('should');
const Gateway = require('../../lib/gateway');

describe('Device', function() {

  describe('addPeripheral', function() {
    it('should return added peripheral', function() {
      const gateway = new Gateway({ id: 'my-device-id' });
      const peripheral = gateway.addPeripheral('my-peripheral-id');
      peripheral.id.should.equal('my-peripheral-id');
    });

    it('should add peripheral to collection', function() {
      const gateway = new Gateway({ id: 'my-device-id' });
      const peripheral = gateway.addPeripheral('my-peripheral-id');
      gateway.peripherals['my-peripheral-id'].should.equal(peripheral);
    });

    it('should return same peripheral if added twice', function() {
      const gateway = new Gateway({ id: 'my-device-id' });
      const peripheralA = gateway.addPeripheral('peripheralA');
      const peripheralB = gateway.addPeripheral('peripheralA');
      peripheralA.should.equal(peripheralB);
    });
  });
});
