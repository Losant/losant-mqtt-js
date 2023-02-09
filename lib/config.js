/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2023 Losant IoT, Inc.
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

module.exports = {

  // Format string that takes deviceId for losant mqtt topic for sending device state.
  topicFormatState: process.env.LOSANT_TOPIC_FORMAT_STATE || 'losant/%s/state',

  // Format string that takes deviceId for losant mqtt topic for receiving commands.
  topicFormatCommand: process.env.LOSANT_TOPIC_FORMAT_MESSAGE || 'losant/%s/command',

  // The losant mqtt endpoint.
  mqttEndpoint: process.env.LOSANT_MQTT_ENDPOINT || 'broker.losant.com'
};
