/**
 * 表单提交
 *
 * @module Form
 */

'use strict';

/**
 * FD
 *
 * @class FD
 * @constructor
 */
var FD = module.exports = function(fields) {
  return this.initialize(fields);
};

function trim(value) {
  return value.replace(/^\s+|\s+$/g, '');
}

function each(data, callback) {
  var i, n;

  for (i = 0, n = data.length; i < n; i++) {
    if (callback(data[i], i, data) === false) {
      break;
    }
  }
}

FD.prototype.initialize = function(fields) {
  var that = this;

  this.dataArray = [];

  if (!fields) {
    return this;
  }

  each(fields, function(field) {
    if (!field.name) {
      return;
    }

    if (field.disabled) {
      return;
    }

    if (field.type === 'radio' || field.type === 'checkbox') {
      if (!field.checked) {
        return;
      }
    }

    that.append(field.name, field.value);
  });

  return this;
};

FD.prototype.append = function(name, value) {
  var found;

  if (typeof value === 'string') {
    value = trim(value);

    var firstChar = value.charAt(0);
    var lastChar = value.substr(-1, 1);

    if ((firstChar === '[' && lastChar === ']') ||
        (firstChar === '{' && lastChar === '}')) {
      try {
        value = JSON.parse(value);
      } catch(e) {
      }
    }
  }

  this._each(function(pair) {
    if (pair.name === name) {
      found = true;

      if (pair.value && pair.value.constructor === Array) {
        pair.value.push(value);
      } else {
        pair.value = [pair.value, value];
      }

      return false;
    }
  });

  if (!found) {
    this.dataArray.push({
      name: name,
      value: value
    });
  }
};

FD.prototype.remove = function(name, value) {
  this._each(function(pair, i, dataArray) {
    if (pair.name === name) {
      if (pair.value === value || (typeof value === 'undefined')) {
        dataArray.splice(i, 1);
      }

      return false;
    }
  });
};

FD.prototype.get = function(name) {
  var value;

  this._each(function(pair) {
    if (pair.name === name) {
      value = pair.value;

      return false;
    }
  });

  return value;
};

FD.prototype.set = function(name, value) {
  this._each(function(pair) {
    if (pair.name === name) {
      if (typeof value === 'string') {
        value = trim(value);

        try {
          value = JSON.parse(value);
        } catch(e) {
        }
      }

      pair.value = value;

      return false;
    }
  });
},

FD.prototype._each = function(callback) {
  each(this.dataArray, callback);
};

FD.prototype.toParam = function() {
  var encode = window.encodeURIComponent,
    param = [];

  this._each(function(pair) {
    var name = pair.name,
      value = pair.value;

    if (name) {
      if (value && typeof value === 'object') {
        value = JSON.stringify(value);
      }

      param.push(encode(name) + '=' + encode(value));
    }
  });

  return param.join('&');
};

FD.prototype.toJSON = function() {
  var json = {};

  this._each(function(pair) {
    if (pair.name) {
      json[pair.name] = pair.value;
    }
  });

  return json;
};
