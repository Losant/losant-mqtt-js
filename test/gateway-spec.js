require('should');
var proxyquire  = require('proxyquire');
var sinon       = require('sinon');
var config      = require('../lib/config');

var mqttStub = { connect: function() { return { on: function() { }}; }};


var gateway = proxyquire('../lib/gateway', { 'mqtt': mqttStub });

describe('Gateway', function() {
  describe('connect', function() {
    it('should call mqtt.connect with correct parameters when supplying no transport', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        'mqtts://' + config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret', port: 8883}
      ).should.equal(true);

      stub.restore();
    });

    it('should call mqtt.connect with correct parameters when supplying tcp transport', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id',
        transport: 'tcp'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        'mqtt://' + config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret', port: 1883}
      ).should.equal(true);

      stub.restore();
    });

    it('should call mqtt.connect with correct parameters when supplying ws transport', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id',
        transport: 'ws'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        'ws://' + config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret', port: 80}
      ).should.equal(true);

      stub.restore();
    });

    it('should call mqtt.connect with correct parameters when supplying wss transport', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id',
        transport: 'wss'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        'wss://' + config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret', port: 443}
      ).should.equal(true);

      stub.restore();
    });

    it('should call mqtt.connect with correct parameters when supplying tls transport', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id',
        transport: 'tls'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        'mqtts://' + config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret', port: 8883}
      ).should.equal(true);

      stub.restore();
    });

    it('should create devices for each device id', function() {
      var g = gateway({
        deviceIds: ['device-id-1', 'device-id-2']
      });

      g.connect();

      g.devices['device-id-1'].id.should.equal('device-id-1');
      g.devices['device-id-2'].id.should.equal('device-id-2');
    });
  });

  describe('handleMessage', function() {
    it('returns an error on non-structure topic', function() {
      var g = gateway({});
      g.handleMessage('not-structure-topic', 'message').message.should.equal('Received message from non-structure topic: not-structure-topic');
    });

    it('returns an error if failed to parse message', function() {
      var g = gateway({});
      g.handleMessage('structure', '{ "not-parsable }').message.should.equal('Failed to parse message.');
    });

    it('returns an error if no device id in topic', function() {
      var g = gateway({});
      g.handleMessage('structure', '{ "type": "msg", "payload" : "foo" }').message.should.equal('Failed to find device id.');
    });

    it('returns an error if no topic family in topic', function() {
      var g = gateway({});
      g.handleMessage('structure/deviceId', '{ "type": "msg", "payload" : "foo" }').message.should.equal('Failed to find topic family.');
    });

    it('calls handleStateMessage if topic family is state', function() {
      var g = gateway({});
      sinon.stub(g, 'handleStateMessage');
      g.handleMessage('structure/deviceId/' + config.topicFamilyState, '{ "attribute" : "value" }');
      g.handleStateMessage.called.should.equal(true);
    });

    it('calls handleMessageMessage if topic family is message', function() {
      var g = gateway({});
      sinon.stub(g, 'handleMessageMessage');
      g.handleMessage('structure/deviceId/' + config.topicFamilyMessage, '{ "type": "msg", "payload" : "foo" }');
      g.handleMessageMessage.called.should.equal(true);
    });

    it('returns an error if topic family is unknown', function() {
      var g = gateway({});
      g.handleMessage('structure/deviceId/foobar', '{ }').message.should.equal('Unknown topic family: foobar');
    });

  });
});
