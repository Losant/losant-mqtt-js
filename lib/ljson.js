/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2022 Losant IoT, Inc.
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


// https://github.com/mongodb-js/extended-json/blob/master/lib/modes/strict.js#L139
const dateReviver = function(value) {
  if (typeof(value.$date) === 'object') {
    value = value.$date.$numberLong;
  } else {
    value = value.$date;
  }
  let date = new Date();
  if (isNaN(date.setTime(value))) {
    date = new Date(value);
  }

  return date;
};

const replacer = function(key, value) {
  // can't trust the passed in value, it won't always be the original
  const origValue = this[key];
  if (origValue === undefined) { return { $undefined: true }; }
  if (origValue === null) { return null; }
  if (typeof(origValue.toISOString) === 'function') {
    return { $date: isNaN(origValue) ? 'NaN' : origValue.toISOString() };
  }

  return value;
};

const buildReviver = function(undefinedTracker) {
  return function(key, value) {
    if (value === null || typeof value !== 'object') { return value; }
    if (value.$undefined) {
      undefinedTracker.push([
        this,
        key
      ]);

      return undefined;
    }
    if (value.$date) { return dateReviver(value); }

    return value;
  };
};

module.exports = {
  stringify: function(value) {
    return JSON.stringify(value, replacer);
  },
  parse: function(value) {
    const undefinedTracker = [];
    const parsed = JSON.parse(value, buildReviver(undefinedTracker));
    undefinedTracker.forEach(function(entry) { entry[0][entry[1]] = undefined; });

    return parsed;
  }
};
