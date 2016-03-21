'use strict'

var $ = require('nd-jquery')
var Form = require('../../index')
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
    expect(elements.length).toEqual(7)
    expect(elements[0] === $('#form-loginName')[0]).toBe(true)
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

  describe('hideGroup()', function(){

    it('隐藏组元素',function(){
      form.hideGroup('apply')
      expect(form.getData()).toEqual({loginName: 'lmm0591', password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
      expect($('[data-group="apply"]').hasClass('ui-form-element-invisible')).toBe(true)
    })

    it('隐藏组元素，并且不获取隐藏的字段的数据',function(){
      expect(form.hideGroup('apply',1))
      expect($('[data-group="apply"]').hasClass('ui-form-element-invisible')).toBe(true)
      expect(form.getData()).toEqual({ loginName: 'lmm0591', password: '123', approve: '1' })
      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="apply_max"]')
      })
      expect(isExis).toBe(false)
    })

    xit('隐藏组元素，并且不验证隐藏的字段的数据',function(){

    })

    xit('隐藏组元素，并且不验证，不获取隐藏的字段的数据',function(){

    })

  })

  describe('setSkip()', function(){
    it('正常访问',function(){
      expect(form.setSkip('loginName',0))
      expect(form.getData()).toEqual({loginName: 'lmm0591', password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="loginName"]')
      })
      expect(isExis).toBe(true)
    })

    it('忽略数据',function(){
      expect(form.setSkip('loginName',1))
      expect(form.getData()).toEqual({ password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
      expect(form.getValue('loginName')).toEqual('lmm0591')

      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="loginName"]')
      })
      expect(isExis).toBe(false)

    })
  })

  it('removeField()',function(){
    expect(form.removeField('loginName'))
    expect(form.getData()).toEqual({ password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
    expect(document.querySelector('[name="loginName"]')).toEqual(null)
  })


  afterEach(function(){
    $('#main').remove()
  })
})
