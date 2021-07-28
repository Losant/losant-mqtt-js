/**
 * These tests perform operations against live Losant devices. In order for
 * these test to correctly run, the following must be setup:
 * Standalone device with { temperature : Number } attribute.
 * Workflow that triggers on standalone device and sends command back to device.
 * Gateway with { temperature : Number } attribute.
 * Peripheral with { temperature: Number } attribute.
 */

const gatewayDeviceId = process.env.GATEWAY_DEVICE_ID || '577bd4699623b80100e3b235';
const peripheralDeviceId = process.env.PERIPHERAL_DEVICE_ID || '577bd49b7b3f830100d9379c';
const accessKey = process.env.ACCESS_KEY || '59fcf8b7-0186-4385-9a74-c8292ed25470';
const accessSecret = process.env.ACCESS_SECRET;

const Gateway = require('../../lib/gateway');
let gateway = null;

describe('Peripheral', function() {

  afterEach(function(done) {
    this.timeout(8000);
    if (gateway) {
      gateway.disconnect(done);
      gateway = null;
    } else {
      done();
    }
  });

  it('should connect, send state, and receive a command', function(done) {
    this.timeout(8000);

    gateway = new Gateway({
      id: gatewayDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    const peripheral = gateway.addPeripheral(peripheralDeviceId);

    gateway.connect(function() {
      setImmediate(function() {
        peripheral.sendState({ temperature: 75 });
      });
    });

    peripheral.on('command', function(command) {
      command.payload.temperature.should.equal(75);
      done();
    });
  });

  it('should reconnect, send state, and receive command', function(done) {
    this.timeout(8000);

    gateway = new Gateway({
      id: gatewayDeviceId,
      key: accessKey,
      secret: accessSecret
    });

    const peripheral = gateway.addPeripheral(peripheralDeviceId);

    gateway.connect(function() {
      setImmediate(function() {
        gateway.mqtt.client.publish('/losant/not-this-device/state');
      });
    });

    gateway.on('reconnected', function() {
      setImmediate(function() {
        peripheral.sendState({ temperature: 65 });
      });
    });

    peripheral.on('command', function(command) {
      command.payload.temperature.should.equal(65);
      done();
    });
  });

});
