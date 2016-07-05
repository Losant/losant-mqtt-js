var should = require('should');
var Device = require('../../lib/device');

/**
 * These tests perform operations against live Losant devices. In order for
 * these test to correctly run, the following must be setup:
 * Standalone device with { temperature : Number } attribute.
 * Workflow that triggers on standalone device and sends command back to device.
 * Gateway with { temperature : Number } attribute.
 * Peripheral with { temperature: Number } attribute.
 */

var standaloneDeviceId = process.env['STANDALONE_DEVICE_ID'] || '577bd42ecabe830100a24c10';
var accessKey = process.env['ACCESS_KEY'] || '59fcf8b7-0186-4385-9a74-c8292ed25470';
var accessSecret = process.env['ACCESS_SECRET'];

var should = require('should');
var Device = require('../../lib/device');

describe('Device', function() {
  it('should connect, send state, and receive a command', function(done) {

    this.timeout(5000);

    var device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.connect(function() {
      // Not guaranteed to be subscribed yet. Give it a little time.
      setTimeout(function() {
        device.sendState({ temperature: 100 });
      }, 500);
    });

    device.on('command', function(command) {
      command.payload.temperature.should.equal(100);
      device.disconnect();
      setTimeout(done, 500);
    });
  });

  it('should reconnect, send state, and receive command', function(done) {

    this.timeout(5000);

    var device = new Device({
      id: standaloneDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    device.connect(function(err) {
      setTimeout(function() {
        // Force-close the connection.
        device.mqtt.client.stream.end();
      }, 500);
    });

    device.on('reconnect', function() {
      setTimeout(function() {
        device.sendState({ temperature: 50 });
      }, 500);
    });

    device.on('command', function(command) {
      command.payload.temperature.should.equal(50);
      device.disconnect();
      setTimeout(done, 500);
    });
  });
});
