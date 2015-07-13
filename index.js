/**
 * @module Form
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var FD = require('nd-formdata');
var Queue = require('nd-queue');
var Template = require('nd-template');

var TEXT_TYPES = 'hidden,text,password,file,email,number,range,date,time,datetime,datetime-local,color,url,mobile,digits';

var SKIP_SUBMIT = 1;
// var SKIP_VALIDATE = 2; // see: nd-validator

function getEventName(e) {
  return e.currentTarget
    .getAttribute('data-role')
    .replace(/\-([a-zA-Z])/g, function(_, $1) {
      return $1.toUpperCase();
    });
}

function filterSkip(elements) {
  var ret = [];
  var i;
  var n = elements.length;

  for (i = 0; i < n; i++) {
    if (!(+(elements[i].getAttribute('data-skip') || '') & SKIP_SUBMIT)) {
      ret.push(elements[i]);
    }
  }

  return ret;
}

var Form = Widget.extend({

  // 使用 handlebars
  Implements: [Template, Queue],

  templateHelpers: {
    isType: function(types, options) {
      types || (types = TEXT_TYPES);

      return types.split(',').indexOf(this.type || 'text') !== -1 ?
        options.fn(this) : options.inverse(this);
    }
  },

  templatePartials: {
    fields: require('./src/fields.handlebars'),
    attrs: require('./src/attrs.handlebars'),
    messages: require('./src/messages.handlebars'),
    options: require('./src/options.handlebars')
  },

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-form',

    // 模板
    template: require('./src/form.handlebars'),

    // 标签名
    nodeNames: {
      item: 'li',
      items: 'ul'
    },

    // 数据
    model: {},

    name: 'form',
    method: 'POST',

    // 提交数据
    formData: {
      getter: function(values) {
        return values;
      },
      setter: function(values) {
        if (!values || this.rendered) {
          return values;
        }

        var matchers = this.get('matchers') || {},
          matchesParsed = {};

        function valueMatcher(value, match, key) {
          if (matchesParsed[key]) {
            match = matchesParsed[key];
          } else if (typeof match === 'string' &&
            /^(\[.+\]|\{.+\})$/.test(match)) {
            try {
              // translate value to array
              match = JSON.parse(match);
              matchesParsed[key] = match;
            } catch (e) {
              // do nothing
            }
          }

          // array
          if (Array.isArray(match)) {
            return match.indexOf(value)!==-1;
          }

          return value === match;
        }

        // 数据处理
        values = this.get('inFilter').call(this, values);

        function setValues(fields) {
          // 初始数据写入到 fields
          fields.forEach(function(field) {
            var value;

            if (field.fields) {
              setValues(field.fields);
              return;
            }

            if (field.name in values) {
              value = values[field.name];

              if (value && typeof value === 'object') {
                value = JSON.stringify(value);
              }

              // 设置当前值
              field.value = value;

              if (field.options) {
                // 设置 option/checkbox/radio 的选中状态
                field.options.forEach(function(option) {
                  option.selected = option.checked =
                    (matchers[field.name] || valueMatcher)(option.value, field.value, field.name);
                });
              }
            }
          });
        }

        setValues(this.get('fields'));

        return values;
      }
    },

    fields: [],

    inFilter: function(data) {
      return data;
    },

    outFilter: function(data) {
      return data;
    }
  },

  events: {
    // for attrs.buttons
    'click button[data-role]': function(e) {
      if (this.trigger(getEventName(e)) === false) {
        // preventing, such as form submit
        e.preventDefault();
      }
    }
  },

  submit: function(callback) {
    this.run(function() {
      if (callback) {
        callback(this.getData());
      } else {
        // TODO: apply outFilter
        this.element.submit();
      }
    }.bind(this));
  },

  initAttrs: function(config) {
    Form.superclass.initAttrs.call(this, config);

    this.set('model', {
      name: this.get('name'),
      action: this.get('action'),
      method: this.get('method'),
      nodeNames: this.get('nodeNames'),
      fields: this.get('fields'),
      buttons: this.get('buttons')
    });
  },

  // 获取实时字段值
  getData: function() {
    return this.get('outFilter').call(this, new FD(this.getElements()).toJSON());
  },

  // 设置字段值
  setData: function(data) {
    data = this.get('inFilter').call(this, data);
    Object.keys(data).forEach(function(name) {
      this.getField(name).val(data[name]).trigger('change');
    }, this);
  },

  getGroup: function(group) {
    return this.$('[data-group="' + group + '"]');
  },

  getElements: function() {
    return filterSkip(this.element[0].elements);
  },

  getItem: function(name) {
    return this.getField(name).closest('[data-role="form-item"]');
  },

  getField: function(name) {
    return this.$('[name="' + name + '"]');
  },

  getValue: function(name) {
    var field = this.getField(name);

    if (!field.length) {
      return;
    }

    if (field.length === 1) {
      return field.val();
    }

    var value = [];

    field.each(function(i, item) {
      if (!/^(?:radio|checkbox)$/.test(item.type) || item.checked) {
        value.push(item.value);
      }
    });

    return value;
  },

  showGroup: function(name) {
    var group = this.getGroup(name)
        .removeClass('ui-form-element-invisible');

    group.find('[name]').each(function(i, field) {
      var _skip = field.getAttribute('data-skip-original');

      if (_skip) {
        field.setAttribute('data-skip', _skip);
        field.removeAttribute('data-skip-original');
      }
    });
  },

  hideGroup: function(name, skip) {
    var group = this.getGroup(name)
        .addClass('ui-form-element-invisible');

    if (typeof skip !== 'undefined') {
      group.find('[name]').each(function(i, field) {
        var _skip = field.getAttribute('data-skip');

        // 0,1,2,3
        field.setAttribute('data-skip-original', _skip || 0);

        field.setAttribute('data-skip', skip);
      });
    }
  },

  setSkip: function(name, value) {
    this.getField(name).attr('data-skip', '' + value);
  },

  setField: function(name, options) {
    var item = this.getItem(name);
    var prev = item.prev();

    if (prev.length) {
      options.parentNode = prev;
      options.insertInto = function(element, parentNode) {
        element.insertAfter(parentNode);
      };
    } else {
      options.insertInto = function(element, parentNode) {
        element.prependTo(parentNode);
      };
    }

    options.name = name;

    this.removeField(name);
    this.addField(options);
  },

  removeField: function(name) {
    this.getItem(name).remove();
  },

  addField: function(options) {
    var insertInto = options.insertInto,
      parentNode = options.parentNode,
      nodeNames = options.nodeNames;

    if (insertInto) {
      delete options.insertInto;
    }

    if (parentNode) {
      // 一般来说是 name xxx
      if (typeof parentNode === 'string') {
        parentNode = this.getItem(parentNode);

        // 此时默认插入到 父对象（item）下方
        if (!insertInto) {
          insertInto = function(element, parentNode) {
            element.insertAfter(parentNode);
          };
        }
      }

      delete options.parentNode;
    } else {
      parentNode = this.$('[data-role="form-items"]');
    }

    if (!insertInto) {
      // 默认插入到父对象里
      insertInto = function(element, parentNode) {
        element.appendTo(parentNode);
      };
    }

    if (nodeNames) {
      delete options.parentNode;
    }

    insertInto($(this.templatePartials.fields({
      classPrefix: this.get('classPrefix'),
      name: this.get('name'),
      nodeNames: nodeNames || this.get('nodeNames'),
      fields: [options]
    }, {
      helpers: this.templateHelpers,
      partials: this.templatePartials
    })), parentNode);
  }

});

module.exports = Form;
