/**
 * These tests perform operations against live Losant devices. In order for
 * these test to correctly run, the following must be setup:
 * Standalone device with { temperature : Number } attribute.
 * Workflow that triggers on standalone device and sends command back to device.
 * Gateway with { temperature : Number } attribute.
 * Peripheral with { temperature: Number } attribute.
 */

var standaloneDeviceId = process.env.STANDALONE_DEVICE_ID || '577bd42ecabe830100a24c10';
var accessKey = process.env.ACCESS_KEY || '59fcf8b7-0186-4385-9a74-c8292ed25470';
var accessSecret = process.env.ACCESS_SECRET;

var should = require('should');
var Device = require('../../lib/device');
var device = null;

describe('Device', function() {

  afterEach(function(done) {
    this.timeout(8000);
    if(device) {
      device.disconnect(done);
      device = null;
    }
    else {
      done();
    }
  });

  it('should connect with and without connect callback', function(done) {
    this.timeout(8000);

    device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.connect(function(err) {
      setImmediate(function() {
        should.not.exist(err);
        device.disconnect(function() {
          setImmediate(function() {
            device.connect();
            setTimeout(function() {
              device.isConnected().should.equal(true);
              done();
            }, 1000);
          });
        });
      });
    });
  });

  it('should connect, send state, and receive a command', function(done) {
    this.timeout(8000);

    device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.connect(function(err) {
      should.not.exist(err);
      setImmediate(function() {
        device.sendState({ temperature: 100 });
      });
    });

    device.on('command', function(command) {
      command.payload.temperature.should.equal(100);
      done();
    });
  });

  it('should reconnect, send state, and receive command', function(done) {
    this.timeout(8000);

    device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.connect(function() {
      // Force-close the connection by
      // attempting to public to restricted topic.
      setImmediate(function() {
        device.mqtt.client.publish('/losant/not-this-device/state');
      });
    });

    device.on('reconnected', function() {
      setImmediate(function() {
        device.sendState({ temperature: 50 });
      });
    });

    device.on('command', function(command) {
      command.payload.temperature.should.equal(50);
      done();
    });
  });

  it('should be able to connect after disconnecting', function(done) {
    this.timeout(8000);

    device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.on('command', function(command) {
      command.payload.temperature.should.equal(100);
      done();
    });

    device.connect(function() {
      setImmediate(function() {
        device.disconnect(function() {
          setImmediate(function() {
            device.connect(function() {
              setImmediate(function() {
                device.sendState({ temperature: 100 });
              });
            });
          });
        });
      });
    });
  });

  it('should provide error in connect callback', function(done) {
    device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: 'invalid secret'
    });

    device.on('error', function() { });

    device.connect(function(err) {
      should.exist(err);
      done();
    });
  });

  describe('isConnected', function() {
    it('should return correct result based on connection status', function(done) {
      this.timeout(8000);

      device = new Device({
        id: standaloneDeviceId,
        key: accessKey,
        secret: accessSecret
      });

      device.isConnected().should.equal(false);

      device.connect(function() {
        device.isConnected().should.equal(true);

        setImmediate(function() {
          device.disconnect(function() {
            device.isConnected().should.equal(false);
            device = null;
            done();
          });
        });
      });
    });
  });
});
