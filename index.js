/**
 * @module: nd-form
 * @author: crossjs <liwenfu@crossjs.com> - 2015-01-16 11:23:31
 */

'use strict';

var $ = require('jquery'),
  Widget = require('nd-widget'),
  Template = require('nd-template');

var Form = Widget.extend({

  // 使用 handlebars
  Implements: Template,

  templateHelpers: {
    isType: function(types, options) {
      // if (!types) {
        // return
      // }
      return $.inArray(this.type || 'text', types.split(',')) !== -1 ?
        options.fn(this) : options.inverse(this);
    }
  },

  templatePartials: {
    attrs: require('./src/attrs.handlebars'),
    messages: require('./src/messages.handlebars'),
    options: require('./src/options.handlebars')
  },

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-form',

    // 模板
    template: require('./src/form.handlebars'),

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
        // 仅在初始化表单时执行一次
        if (!values) {
          return;
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

        // 初始数据写入到 fields
        $.each(this.get('fields'), function(i, field) {
          var value;
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

        // 最终返回 undefined，写入到 value
        // 以确保表单提交读取的是 serialize
      }
    }
  },

  events: {
    'submit': function(e) {
      this.trigger('submit', e);
    }
  },

  getElements: function() {
    return this.element[0].elements;
  },

  parseElement: function() {
    this.set('model', {
      name: this.get('name'),
      action: this.get('action'),
      method: this.get('method'),
      values: this.get('values'),
      fields: this.get('fields'),
      buttons: this.get('buttons')
    });

    Form.superclass.parseElement.call(this);
  }

});

module.exports = Form;
