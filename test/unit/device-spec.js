var should = require('should');
var Device = require('../../lib/device');

/* eslint no-new: "off", no-unused-expressions: "off"*/

describe('Device', function() {

  describe('constructor', function() {
    it('should return device object intialized correctly', function() {
      var device = new Device({ id: 'my-device-id' });
      device.id.should.equal('my-device-id');
    });

    it('should throw if ID is not specified', function() {
      var exception = false;
      try {
        new Device();
      }
      catch(e) {
        exception = true;
      }
      exception.should.be.equal(true);
    });

    it('should return device object correctly using environment variable', function() {
      process.env.LOSANT_DEVICE_ID = 'my-device-id';
      process.env.LOSANT_ACCESS_KEY = 'my-device-key';
      process.env.LOSANT_ACCESS_SECRET = 'my-device-secret';

      var device = new Device();

      device.id.should.equal('my-device-id');
      device.options.key.should.equal('my-device-key');
      device.options.secret.should.equal('my-device-secret');

      delete process.env.LOSANT_DEVICE_ID;
      delete process.env.LOSANT_ACCESS_KEY;
      delete process.env.LOSANT_ACCESS_SECRET;
    });
  });

  describe('isConnected', function() {
    it('should return false if never connected', function() {
      var device = new Device({
        id: 'my-device-id',
        key: 'my-access-key',
        secret: 'my-access-secret'
      });

      device.isConnected().should.equal(false);
    });
  });

  describe('sendState', function() {
    it('automatically applies time if not provided', function() {
      var device = new Device({ id: 'my-device-id' });
      var sent = device.sendState({ test: 'value' });
      sent.payload.time.should.be.ok;
    });

    it('should use time if specified', function() {
      var device = new Device({ id: 'my-device-id' });
      var date = new Date(2016, 1, 20);
      var sent = device.sendState({ test: 'value' }, date);

      sent.payload.time.getTime().should.equal(date.getTime());
    });

    it('should callback with error if not connected', function(done) {
      var device = new Device({ id: 'my-device-id' });
      device.sendState({ test: 'value' }, function(err) {
        should.exist(err);
        done();
      });
    });
  });

  describe('handleMessage', function() {

    it('should return null if topic does not match device\'s command topic', function() {
      var device = new Device({ id: 'my-device-id' });
      var result = device.handleMessage('losant/not-the-id/command', '');
      should.not.exist(result);
    });

    it('should return null if bad message', function() {
      var device = new Device({ id: 'my-device-id' });
      var result = device.handleMessage('losant/my-device-id/command', 'not-valid-json {}');
      should.not.exist(result);
    });

    it('should return null if message is null', function() {
      var device = new Device({ id: 'my-device-id' });
      var result = device.handleMessage('losant/my-device-id/command', 'null');
      should.not.exist(result);
    });

    it('should return message if valid', function() {
      var device = new Device({ id: 'my-device-id' });
      var result = device.handleMessage('losant/my-device-id/command', '{ "foo" : "bar" }');
      result.foo.should.equal('bar');
    });
  });
});
