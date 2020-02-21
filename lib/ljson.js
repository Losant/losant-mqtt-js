// https://github.com/mongodb-js/extended-json/blob/master/lib/modes/strict.js#L139
var dateReviver = function(value) {
  if (typeof(value.$date) === 'object') {
    value = value.$date.$numberLong;
  }
 else {
    value = value.$date;
  }
  var date = new Date();
  if (isNaN(date.setTime(value))) {
    date = new Date(value);
  }

  return date;
};

var replacer = function(key, value) {
  // can't trust the passed in value, it won't always be the original
  var origValue = this[key];
  if (origValue === undefined) { return { $undefined: true }; }
  if (origValue === null) { return null; }
  if (typeof(origValue.toISOString) === 'function') {
    return { $date: isNaN(origValue) ? 'NaN' : origValue.toISOString() };
  }

  return value;
};

var buildReviver = function(undefinedTracker) {
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
    var undefinedTracker = [];
    var parsed = JSON.parse(value, buildReviver(undefinedTracker));
    undefinedTracker.forEach(function(entry) { entry[0][entry[1]] = undefined; });

    return parsed;
  }
};
