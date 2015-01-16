/**
 * @module: nd-form
 * @author: crossjs <liwenfu@crossjs.com> - 2015-01-16 11:23:31
 */

'use strict';

var
  $ = require('jquery'),
  // Promise = require('promise'),
  Widget = require('nd-widget'),
  Template = require('nd-template'),
  Validator = require('nd-validator'),
  Ajax = require('nd-ajax');

// Placeholders runs automatically
require('placeholders.js');

var Form = module.exports = Widget.extend({

  // 使用 handlebars
  Implements: Template,

  templateHelpers: {
    isType: function(types, options) {
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

    itemClass: 'ui-form-item',

    name: 'form',
    method: 'POST',

    // 提交数据
    formData: {
      getter: function(values) {
        // 第一次，取默认值，用于表单初始化
        // 第 N 次，取表单实时值，用于表单提交
        return values || this.element.serialize();
      },
      setter: function(values) {
        if (!values) {
          return;
        }

        // 初始数据写入到 fields
        $.each(this.get('fields'), function(i, field) {
          if (field.name in values) {
            // 设置当前值
            field.value = values[field.name];

            if (field.options) {
              // 设置 option/checkbox/radio 的选中状态
              $.each(field.options, function(j, option) {
                if (option.value === field.value) {
                  option.selected = option.checked = true;
                }
              });
            }
          }
        });

        // 最终返回 undefined，写入到 value
        // 以确保表单提交读取的是 serialize
      }
    },

    // 返回数据类型
    dataType: 'json',

    // 表单就绪后初始化验证
    afterRender: '_initValidator'
  },

  parseElement: function() {
    this.set('model', {
      classPrefix: this.get('classPrefix'),
      itemClass: this.get('itemClass'),
      name: this.get('name'),
      action: this.get('action'),
      method: this.get('method'),
      values: this.get('values'),
      fields: this.get('fields'),
      buttons: this.get('buttons')
    });

    Form.superclass.parseElement.call(this);
  },

  _initValidator: function() {
    var that = this;

    // Widget.autoRenderAll();

    this.validtor = new Validator({
      element: this.element,
      failSilently: true,
      autoSubmit: false,
      displayHelper: function(item) {
        var label, id,
          parent = item.element.parent('.checkbox-group, .radio-group');

        id = parent.length ? parent.attr('id') : item.element.attr('id');

        if (id) {
          label = $('label[for="' + id + '"]').text();
        }

        return label || item.element.attr('name');
      },
      // showMessage: function(message, element) {
      //   this.getExplain(element).html(message);
      //   this.getItem(element).addClass(this.get('itemErrorClass'));
      // },
      // hideMessage: function(message, element) {
      //   this.getExplain(element).html(element.data('explain') || ' ');
      //   this.getItem(element).removeClass(this.get('itemErrorClass'));
      // },
      onFormValidated: function(err/*, results, form*/) {
        if (!err) {
          that.submit();
        }
      }
    });
  },

  submit: function() {
    new Ajax({
      settings: {
        url: this.get('action'),
        type: this.get('method'),
        data: this.get('formData'),
        dataType: this.get('dataType')
      },
      events: this.get('ajaxEvents'),
      handlers: this.get('ajaxHandlers')
    });
  }

});
