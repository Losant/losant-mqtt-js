const should = require('should');
const Device = require('../../lib/device');

/* eslint no-new: "off", no-unused-expressions: "off"*/

describe('Device', function() {

  describe('constructor', function() {
    it('should return device object initialized correctly', function() {
      const device = new Device({ id: 'my-device-id' });
      device.id.should.equal('my-device-id');
    });

    /* jshint ignore:start */
    it('should throw if ID is not specified', function() {
      let exception = false;
      try {
        new Device();
      } catch (e) {
        exception = true;
      }
      exception.should.be.equal(true);
    });
    /* jshint ignore:end */
  });

  describe('isConnected', function() {
    it('should return false if never connected', function() {
      const device = new Device({
        id: 'my-device-id',
        key: 'my-access-key',
        secret: 'my-access-secret'
      });

      device.isConnected().should.equal(false);
    });
  });

  describe('sendState', function() {
    it('automatically applies time if not provided', function() {
      const device = new Device({ id: 'my-device-id' });
      const sent = device.sendState({ test: 'value' });
      sent.payload.time.should.be.ok;
    });

    it('should use time if specified', function() {
      const device = new Device({ id: 'my-device-id' });
      const date = new Date(2016, 1, 20);
      const sent = device.sendState({ test: 'value' }, date);

      sent.payload.time.getTime().should.equal(date.getTime());
    });

    it('should callback with error if not connected', function(done) {
      const device = new Device({ id: 'my-device-id' });
      device.sendState({ test: 'value' }, function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('handleMessage', function() {

    it('should return null if topic does not match device\'s command topic', function() {
      const device = new Device({ id: 'my-device-id' });
      const result = device.handleMessage('losant/not-the-id/command', '');
      should.not.exist(result);
    });

    it('should return null if bad message', function() {
      const device = new Device({ id: 'my-device-id' });
      const result = device.handleMessage('losant/my-device-id/command', 'not-valid-json {}');
      should.not.exist(result);
    });

    it('should return null if message is null', function() {
      const device = new Device({ id: 'my-device-id' });
      const result = device.handleMessage('losant/my-device-id/command', 'null');
      should.not.exist(result);
    });

    it('should return message if valid', function() {
      const device = new Device({ id: 'my-device-id' });
      const result = device.handleMessage('losant/my-device-id/command', '{ "foo" : "bar" }');
      result.foo.should.equal('bar');
    });
  });
});
