/**
 * @module: nd-form
 * @author: crossjs <liwenfu@crossjs.com> - 2015-01-16 11:23:31
 */

'use strict';

var $ = require('jquery');
var Widget = require('nd-widget');
var FD = require('nd-formdata');
var Queue = require('nd-queue');
var Template = require('nd-template');

var TEXT_TYPES = 'hidden,text,password,file,email,number,range,date,time,datetime,datetime-local,color,url,mobile,digits';

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
    if (elements[i].getAttribute('data-skip') !== 'true') {
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

      return $.inArray(this.type || 'text', types.split(',')) !== -1 ?
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
          if (match && typeof match === 'object') {
            return $.inArray(value, match) !== -1;
          }

          return value === match;
        }

        // 数据处理
        values = this.get('inFilter').call(this, values);

        function setValues(fields) {
          // 初始数据写入到 fields
          $.each(fields, function(i, field) {
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
                $.each(field.options, function(j, option) {
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

  getData: function() {
    return this.get('outFilter').call(this, new FD(this.getElements()).toJSON());
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
