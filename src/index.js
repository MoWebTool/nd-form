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

/*
.initAttrs() // 初始化属性，将实例化时的数据和默认属性做混合
.parseElement() // 模板解析
.initProps() // 提供给用户处理属性
.delegateEvents() // 事件代理，将事件代理到 `this.element` 上
.setup() // 实例化最后一步，用户自定义操作，提供给子类继承。
 */

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
    attrs: require('./attrs.handlebars'),
    messages: require('./messages.handlebars'),
    options: require('./options.handlebars')
  },

  attrs: {
    // 统一样式前缀
    classPrefix: 'ui-form',

    // 模板
    template: require('./form.handlebars'),

    // 数据
    model: {},

    values: {
      setter: function(values) {
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
      }
    },

    itemClass: 'ui-form-item',

    name: 'form',
    method: 'POST',

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
        type: 'PATCH',
        data: this.element.serialize(),
        dataType: 'json'
      },
      events: this.get('ajaxEvents')
    });
  }

});
