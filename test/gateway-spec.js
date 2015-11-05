require('should');
var proxyquire  = require('proxyquire');
var sinon       = require('sinon');
var config      = require('../lib/config');

var mqttStub = { connect: function() { return { on: function() { }}; }};


var gateway = proxyquire('../lib/gateway', { 'mqtt': mqttStub });

describe('Gateway', function() {
  describe('connect', function() {
    it('should call mqtt.connect with correct parameters', function() {
      var g = gateway({
        key: 'test-key',
        secret: 'test-secret',
        gatewayId: 'test-gateway-id'
      });

      var stub = sinon.stub(mqttStub, 'connect');
      stub.returns({ on: function() { }});

      g.connect();

      stub.calledWith(
        config.mqttEndpoint,
        { clientId: 'test-gateway-id', username: 'test-key', password: 'test-secret'}
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
