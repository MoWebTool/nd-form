'use strict'

var $ = require('nd-jquery')
var Widget = require('nd-widget')
var FD = require('nd-formdata')
var Queue = require('nd-queue')
var Template = require('nd-template')

var SKIP_SUBMIT = 1
// var SKIP_VALIDATE = 2 // see: nd-validator

var DATA_SKIP = 'data-skip'
var DATA_SKIP_ORIGINAL = 'data-skip-original'

function getEventName(e) {
  return e.currentTarget
    .getAttribute('data-role')
    .replace(/\-([a-zA-Z])/g, function(_, $1) {
      return $1.toUpperCase()
    })
}

function filterSkip(elements) {
  var ret = []
  var i
  var n = elements.length

  for (i = 0; i < n; i++) {//过滤不用提交的数据
    if (!(+(elements[i].getAttribute(DATA_SKIP) || '') & SKIP_SUBMIT)) {
      ret.push(elements[i])
    }
  }

  return ret
}

/**
 * 表单组件
 *
 *
 *
    $('<div id="main"/>').appendTo('body')
    new Form({
      fields: [{
        icon: 'user-o',
        name: 'loginName',
        value: 'lmm0591',
        attrs: {
          placeholder: '帐号'
        }
      }, {
        icon: 'lock-o',
        name: 'password',
        type: 'password',
        value: '123',
        attrs: {
          required: 'required'
        }
      }, {
        name: 'approve',
        label: '需要审核',
        type: 'radio',
        options: [{
          text: '否',
          value: 1,
          checked: true
        }, {
          text: '是',
          value: 2
        }]
      },{
        group: 'apply',
        fields: [{
          name: 'apply_max',
          label: '报名人数上限'
        },{
          name: 'apply_min',
          label: '报名人数下限'
        }]
      }],
      // 配置按钮
      buttons: [{
        label: '登录',
        type: 'submit',
        role: 'form-submit'
      }],
      parentNode: '#main'
    }).on('formSubmit',function(data){
      console.log(data)
    }).render()

 *
 * @class ND.Form
 * @author crossjs <liwenfu@crossjs.com>
 * @extends Widget
 */
var Form = Widget.extend({

  // 使用 handlebars
  Implements: [Template, Queue],

  templateHelpers: {
    oneOf: require('./src/oneOf'),
    equal: require('./src/equal')
  },

  templatePartials: {
    fields: require('./src/fields.handlebars'),
    attrs: require('./src/attrs.handlebars'),
    messages: require('./src/messages.handlebars'),
    options: require('./src/options.handlebars')
  },

  attrs: {


    /**
		 * 统一样式前缀
		 * @cfg {String} classPrefix
		 */
    classPrefix: 'ui-form',

    /**
		 * 模板
		 * @cfg {String} template
		 */
    template: require('./src/form.handlebars'),

    /**
		 * 标签名
		 * @cfg {Object} nodeNames
		 * @cfg {String} nodeNames.items = 'ul'
		 * @cfg {String} nodeNames.item = 'li'
		 */
    nodeNames: {
      item: 'li',
      items: 'ul'
    },

    /**
		 *  数据
		 * @cfg {Object} model
		 */
    model: {},

    /**
		 * form 元素的 name 属性的值
		 * @cfg {String} [name='form']
		 */
    name: 'form',

    /**
		 * form 元素的 method 属性的值
		 * @cfg {String} [method='POST']
		 */
    method: 'POST',

    // 提交数据
    formData: {
      getter: function(values) {
        return values
      },
      setter: function(values) {
        if (!values || this.rendered) {
          return values
        }

        var matchers = this.get('matchers') || {},
          matchesParsed = {}

        function valueMatcher(value, match, key) {
          if (matchesParsed[key]) {
            match = matchesParsed[key]
          } else if (typeof match === 'string' &&
            /^(\[.+\]|\{.+\})$/.test(match)) {
            try {
              // translate value to array
              match = JSON.parse(match)
              matchesParsed[key] = match
            } catch (e) {
              // do nothing
            }
          }

          // array
          if (Array.isArray(match)) {
            return match.indexOf(value) !== -1
          }

          return value === match
        }

        // 数据处理
        values = this.get('inFilter').call(this, values)

        function setValues(fields) {
          // 初始数据写入到 fields
          fields.forEach(function(field) {
            var value

            if (field.fields) {
              setValues(field.fields)
              return
            }

            if (field.name in values) {
              value = values[field.name]

              if (value && typeof value === 'object') {
                value = JSON.stringify(value)
              }

              // 设置当前值
              field.value = value

              if (field.options) {
                // 设置 option/checkbox/radio 的选中状态
                field.options.forEach(function(option) {
                  option.selected = option.checked =
                    (matchers[field.name] || valueMatcher)(option.value, field.value, field.name)
                })
              }
            }
          })
        }

        setValues(this.get('fields'))

        return values
      }
    },


    /**
     * @cfg {Array} fields 表单的元素
     *
     * @cfg {String} fields.name 元素名，用于标识该元素（getItem(name)，getField(name) 常用到该属性）
     * @cfg {String} fields.icon 图标
     * @cfg {String} fields.cls class 属性
     * @cfg {String} fields.label 标题
     * @cfg {String} fields.prefix 前缀文字
     * @cfg {String} fields.value 字段值
     * @cfg {String} fields.type 字段类型（textarea,multiline,select,static,custom,hidden,text,password,file,email,number,range,date,time,datetime,datetime-local,color,url,mobile,digits）
     * @cfg {String} fields.html
     * @cfg {String} fields.suffix 后缀文字
     * @cfg {String} fields.comment 备注
     *
     * @cfg {Array} fields.groups 组元素
     * @cfg {Boolean} fields.groups.required 是否为必填
     * @cfg {String} fields.groups.cls class 属性
     * @cfg {String} fields.groups.label 标题
     * @cfg {Boolean} fields.groups.inline 是否显示为行模式
     * @cfg {Array} fields.groups.fields
     * @cfg {String} fields.groups.comment 备注
     *
     * @cfg {Array} fields.options 适用于 select,radio,checkbox 元素
     * @cfg {String} fields.options.value
     * @cfg {Boolean} fields.options.checked
     * @cfg {String} fields.options.text
     *
     * @cfg {Array} fields.attrs 设置元素上的属性值
     * @cfg {Boolean} fields.attrs.required 是否为必填
     *
     * @cfg {Array} fields.buttons 表单按钮
     * @cfg {String} fields.buttons.role 按钮动作
     * @cfg {String} fields.buttons.type 按钮类型，当设置成 custom 时，可以自定义按钮（如: '<a>点击</a>'）
     * @cfg {String} fields.buttons.label 按钮文字
     * @cfg {Boolean} fields.buttons.disabled 是否禁用按钮
     */
    fields: [],

    /**
     * 输入过滤器
     * @cfg {Function} inFilter
     * @param {Object} data 原始数据
     * @return {Object} 返回过滤后的数据
     */
    inFilter: function(data) {
      return data
    },

    /**
		 * 输出过滤器
     * @cfg {Function} outFilter
     * @param {Object} data 原始数据
     * @return {Object} 返回过滤后的数据
		 */
    outFilter: function(data) {
      return data
    },




    /**
		 * @cfg {Function} formCancel
     * @param {Function} callback 运行该函数，触发 {@link ND.Form#event-formCancel formCancel} 事件
		 */
    formCancel: function(callback) {
      var _formCancel = this._formCancel

      if (_formCancel) {
        // clean first
        delete this._formCancel

        _formCancel(callback)
        return false
      }

      return callback()
    },



    /**
		 * @cfg {Function} formSubmit
     * @param {Function} callback 运行该函数，触发 {@link ND.Form#event-formSubmit formSubmit} 事件
     * @return {Object} 返回过滤后的数据
		 */
    formSubmit: function(callback) {
      var form = this
      form.run(function() {
        if (callback) {
          callback(form.getData())
        } else {
          form.element.submit()
        }
      })

      return false
    }
  },


  /**
   * @event formSubmit
   * 点击提交按钮，触发该事件，不触发原生的 submit 事件
   * @param {Object} data 表单的数据
   */

  /**
   * @event formCancel
   * 点击取消按钮，触发该事件
   * @return {Boolean} 返回 false 则阻止事件冒泡
   */


  events: {
    // for attrs.buttons
    'click button[data-role]': function(e) {
      var form = this
      var name = getEventName(e)
      var wrap = form.get(name) || function(callback) {
        return callback()
      }
      var callback = function(data) {
        // on('formXXX')
        if (form.trigger(name, data) === false) {
          e.preventDefault()
        }
        // if return false here, wrap will return false, the PD
      }

      // attrs.formXxx
      if (wrap.call(form, callback) === false) {
        e.preventDefault()
      }
    }
  },

  initAttrs: function(config) {
    Form.superclass.initAttrs.call(this, config)

    this.set('model', {
      name: this.get('name'),
      action: this.get('action'),
      method: this.get('method'),
      nodeNames: this.get('nodeNames'),
      fields: this.get('fields'),
      buttons: this.get('buttons')
    })
  },

  // for grid
  installCancel: function(callback) {
    if (callback) {
      this._formCancel = callback
    } else {
      delete this._formCancel
    }
  },

  // for grid
  triggerCancel: function() {
    this.$('[data-role="form-cancel"]').trigger('click')
  },

  /**
   * 获取实时字段值
   *
   *     form = new Form({xxxx});
   *     form.getData()
   *
   * @method getData
   * @return {Object} 表单数据
   */
  getData: function() {
    return this.get('outFilter').call(this, new FD(this.getElements()).toJSON())
  },

  /**
   * 设置字段值
   *
   *     form = new Form({xxxx});
   *     form.setData({name:'小明'})
   *
   * @method setData
   * @param {Object} data 新的字段值
   */
  setData: function(data) {
    data = this.get('inFilter').call(this, data)
    Object.keys(data).forEach(function(name) {
      this.getField(name).val(data[name]).trigger('change')
    }, this)
  },

  /**
   * 获取组元素
   * @method getGroup
   * @param {String} group 组名
   * @return {JQElement} 该组名对应的组元素
   */
  getGroup: function(group) {
    return this.$('[data-group="' + group + '"]')
  },

  /**
   * 获取表单下的所属元素
   * @method getElements
   * @return {Array} element 数组
   */
  getElements: function() {
    return filterSkip(this.element[0].elements)
  },

  /**
   * 获取字段的元素的容器
   * @param name 根据字段的 name 属性查找字段元素的容器
   * @method getItem
   * @return {Element}
   */
  getItem: function(name) {
    return this.getField(name).closest('[data-role="form-item"]')
  },

  /**
   * 获取字段的元素
   * @method getField
   * @param  {String} name
   * @return {JQElement} 该字段对应的元素
   */
  getField: function(name) {
    return this.$('[name="' + name + '"]')
  },

  /**
   * 获取字段的元素的值
   * @method getValue
   * @param  {String} name 根据字段的 name 属性查找字段元素的
   * @return {Array/String} 该字段对应的元素,如果是 radio 或 checkbox 元素则返回数组
   */
  getValue: function(name) {
    var field = this.getField(name)

    if (!field.length) {
      return
    }

    if (field.length === 1) {
      return field.val()
    }

    var value = []

    field.each(function(i, item) {
      if (!/^(?:radio|checkbox)$/.test(item.type) || item.checked) {
        value.push(item.value)
      }
    })

    return value
  },

  /**
   * 显示组元素
   * @method showGroup
   * @param  {String} name 根据字段的 name 属性显示组元素
   */
  showGroup: function(name) {
    var group = this.getGroup(name)
      .removeClass('ui-form-element-invisible')

    group.find('[name]').each(function(i, field) {
      var _skip = field.getAttribute(DATA_SKIP_ORIGINAL)

      if (_skip) {
        field.setAttribute(DATA_SKIP, _skip)
        field.removeAttribute(DATA_SKIP_ORIGINAL)
      }
    })
  },

  /**
   * 隐藏组元素
   * @method hideGroup
   * @param  {String} name 根据字段的 name 属性显示组元素
   * @param  {Number/String} [skip = 0] 字段上数据的{@link ND.Form#setSkip 访问等级}.
   */
  hideGroup: function(name, skip) {
    var group = this.getGroup(name)
      .addClass('ui-form-element-invisible')

    if (typeof skip !== 'undefined') {
      group.find('[name]').each(function(i, field) {
        //如果有 SKIP 就暂存到别的属性中，以后显示时在换回
        if (!field.getAttribute(DATA_SKIP_ORIGINAL)) {
          var _skip = field.getAttribute(DATA_SKIP)
          // 0,1,2,3
          field.setAttribute(DATA_SKIP_ORIGINAL, _skip || 0)
        }
        field.setAttribute(DATA_SKIP, skip)
      })
    }
  },

  /**
   * 设置字段的访问等级
   *
   *     form = new Form({xxxx});
   *     form.setSkip(name,1)
   *
   * @method setSkip
   * @param {String} name 字段的 name 属性
   * @param  {Number/String} skip 字段上数据的访问等级
   *
   * 0 验证数据<br />
   * 1 忽略数据，getData，getElements 方法不能访问到该字段<br />
   * 2 TODO:validator<br />
   * 3 TODO:validator<br />
   *
   */
  setSkip: function(name, value) {
    this.getField(name).attr(DATA_SKIP, '' + value)
  },

  /**
   * 设置字段
   * @method setField
   * @param {String} name 要设置的字段
   * @param {Object} options 字段的选项见 {@link ND.Form#fields fields 参数}
   */
  setField: function(name, options) {
    var item = this.getItem(name)
    var prev = item.prev()

    if (prev.length) {
      options.parentNode = prev
      options.insertInto = function(element, parentNode) {
        element.insertAfter(parentNode)
      }
    } else {
      options.insertInto = function(element, parentNode) {
        element.prependTo(parentNode)
      }
    }

    options.name = name

    this.removeField(name)
    debugger
    this.addField(options)
  },

  /**
   * 删除字段
   * @method removeField
   * @param {String} name 字段的 name
   */
  removeField: function(name) {
    this.getItem(name).remove()
  },

  /**
   * 增加字段
   * @method addField
   * @param {Object} options 字段的选项
   * @param {Function} options.insertInto 控制插入字段函数
   *
   * - element 新创建的元素
   * - parentNode 参照 options.parentNode 参数
   *
   * @param {String/Element/JQElement} options.parentNode = 表单元素
   *
   * - 类型为 String 时，就根据字段的 name 属性查找对应字段，并插入到该字段的后面
   * - 类型为 Element/JQElement 时，插入到该元素的里面
   *
   * @param {Object} options.nodeNames 创建元素的类型
   * @param {String} options.nodeNames.items = 'ul'
   * @param {String} options.nodeNames.item = 'li'
   * {@link ND.Form#fields 额外参数}
   */
  addField: function(options) {
    var insertInto = options.insertInto,
      parentNode = options.parentNode,
      nodeNames = options.nodeNames

    if (insertInto) {
      delete options.insertInto
    }

    if (parentNode) {
      // 一般来说是 name xxx
      if (typeof parentNode === 'string') {
        parentNode = this.getItem(parentNode)

        // 此时默认插入到 父对象（item）下方
        if (!insertInto) {
          insertInto = function(element, parentNode) {
            element.insertAfter(parentNode)
          }
        }
      }

      delete options.parentNode
    } else {
      parentNode = this.$('[data-role="form-items"]')
    }

    if (!insertInto) {
      // 默认插入到父对象里
      insertInto = function(element, parentNode) {
        element.appendTo(parentNode)
      }
    }

    if (nodeNames) {
      delete options.parentNode
    }

    insertInto($(this.templatePartials.fields({
      classPrefix: this.get('classPrefix'),
      name: this.get('name'),
      nodeNames: nodeNames || this.get('nodeNames'),
      fields: options.fields || [options]
    }, {
      helpers: this.templateHelpers,
      partials: this.templatePartials
    })), parentNode)
  }

})

module.exports = Form
