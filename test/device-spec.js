require('should');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var config = require('../lib/config');

var mqttStub = { connect: function() { return { on: function() { }}; }};

var Device = proxyquire('../lib/device', { 'mqtt' : mqttStub });

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
  });

  describe('connect', function() {
    it('should call mqtt.connect with correct parameters', function() {
      var device = new Device({
        id: 'my-device-id',
        key: 'my-access-key',
        secret: 'my-access-secret'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      device.connect();

      stub.calledWith(
        'mqtts://' + config.mqttEndpoint,
        {
          clientId: 'my-device-id',
          username: 'my-access-key',
          password: 'my-access-secret',
          port: 8883
        }
      ).should.equal(true);

      stub.restore();
    });
  });

  describe('sendState', function() {
    it('automatically applies time if not provided', function() {
      var device = new Device({ id: 'my-device-id' });
      var sent = device.sendState({ test : 'value' });
      sent.payload.time.should.be.ok;
    });

    it('should use time if specified', function() {
      var device = new Device({ id: 'my-device-id' });
      var date = new Date(2016, 1, 20);
      var sent = device.sendState({ test: 'value' }, date);

      sent.payload.time.getTime().should.equal(date.getTime());
    });

    it('should callback with time argument optional', function(done) {
      var device = new Device({ id: 'my-device-id' });
      device.sendState({ test: 'value' }, done);
    });
  });
});
