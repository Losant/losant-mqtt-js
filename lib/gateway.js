/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2021 Losant IoT, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const util = require('util');
const Device = require('./device');
const Peripheral = require('./peripheral');
const debug = require('debug')('losant:gateway');

/**
 * Gateway constructor.
 * @param {Object} options - options to pass to the device class such as id, key and secret
 * @return {undefined} undefined
 */
const Gateway = function(options) {
  Device.call(this, options);

  this.peripherals = {};
};

util.inherits(Gateway, Device);

Gateway.prototype.addPeripheral = function(deviceId) {

  if (this.peripherals[deviceId]) {
    return this.peripherals[deviceId];
  }

  debug(`Adding peripheral to gateway: ${deviceId}`);
  const peripheral = new Peripheral({ id: deviceId, mqtt: this.mqtt, gateway: this });
  this.peripherals[deviceId] = peripheral;

  return peripheral;
};

module.exports = Gateway;
