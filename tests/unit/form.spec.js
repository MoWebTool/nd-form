'use strict'

var $ = require('nd-jquery')
var Form = require('../index')
//var debug = require('debug')

describe('(app) home',function(){
  var form

  beforeEach(function(){
    $('<div id="main"/>').appendTo('body')
    form = new Form({
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
          name: 'apply_limit',
          label: '报名人数上限'
        }]
      }],
      // 配置按钮
      buttons: [{
        label: '登录',
        type: 'submit',
        role: 'form-submit'
      }],
      parentNode: '#main'
    }).render()
  })

  it('getData() 获取数据', function(){
    var data = form.getData()
    form.$('[name="loginName"]').val('222222')
    expect(data.loginName).toEqual('lmm0591')
    expect(data.password).toEqual('123')
  })

  it('setData() 设置数据', function(){
    form.setData({loginName:'我是新的值'})
    var data = form.getData()
    expect(form.$('[name="loginName"]').val()).toEqual('我是新的值')
    expect(data.loginName).toEqual('我是新的值')
  })

  it('getElements() 获取表单下的所属元素', function(){
    var elements = form.getElements()
    expect(elements.length).toEqual(6)
    expect(elements[0] === $('#form-loginName')[0]).toBe(true)
    expect(elements[5] === $('.button-form-submit')[0]).toBe(true)
  })

  it('getItem() 获取字段的元素的容器', function(){
    var item = form.getItem('loginName')
    //元素中带有 data-role='form-item' 属性的为容器
    expect(item.attr('data-role')).toEqual('form-item')
    expect(item.find('[name="loginName"]').length).toEqual(1)
  })

  it('getField() 获取字段的元素', function(){
    var field = form.getField('loginName')
    expect(field.val()).toEqual('lmm0591')
  })

  it('getValue() 获取字段的元素的值', function(){
    expect(form.getValue('loginName')).toEqual('lmm0591')
    expect(form.getValue('approve')).toEqual(['1'])
  })

  afterEach(function(){
    $('#main').remove()
  })
})
