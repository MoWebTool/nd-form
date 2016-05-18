'use strict'

var $ = require('nd-jquery')
var Form = require('../index')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var assert = chai.assert
chai.use(sinonChai)
//var debug = require('debug')

describe('测试 Form 组件的 API',function(){
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
    assert.equal(data.loginName , 'lmm0591')
    assert.equal(data.password , '123')
  })

  it('setData() 设置数据', function(){
    form.setData({loginName:'我是新的值'})
    var data = form.getData()
    assert.equal(form.$('[name="loginName"]').val() , '我是新的值')
    assert.equal(data.loginName , '我是新的值')
  })

  it('getElements() 获取表单下的所属元素', function(){
    var elements = form.getElements()
    assert.equal(elements.length , 7)
    assert.isTrue(elements[0] === $('#form-loginName')[0])
  })

  it('getItem() 获取字段的元素的容器', function(){
    var item = form.getItem('loginName')
    //元素中带有 data-role='form-item' 属性的为容器
    assert.equal(item.attr('data-role') , 'form-item')
    assert.equal(item.find('[name="loginName"]').length , 1)
  })

  it('getField() 获取字段的元素', function(){
    var field = form.getField('loginName')
    assert.equal(field.val() , 'lmm0591')
  })

  it('getValue() 获取字段的元素的值', function(){
    assert.equal(form.getValue('loginName') , 'lmm0591')
    assert.deepEqual(form.getValue('approve') , ['1'])
  })


  it('showGroup() 显示一组字段',function(){
    form.hideGroup('apply',1)
    assert.isUndefined(form.getData().apply_max)
    assert.isUndefined(form.getData().apply_min)
    form.showGroup('apply')
    assert.strictEqual(form.getData().apply_max, '')
    assert.strictEqual(form.getData().apply_min, '')
    assert.isFalse($('[data-group="apply"]').hasClass('ui-form-element-invisible'))
  })

  describe('formData()', function() {

    it('设置表单的初使属性', function() {
      form.destroy()
      $('#main').remove()

      $('<div id="main"/>').appendTo('body')
      form = new Form({
        formData: {approve:2,loginName:'张三'},
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
        }],
        parentNode: '#main'
      }).render()

      assert.deepEqual(form.get('formData'), { loginName: '张三', approve: 2 })
      assert.deepEqual(form.getData().loginName, '张三')
      assert.deepEqual(form.getData().approve, '2' )
      assert.deepEqual(form.getValue('approve'), ['2'] )
    })
  })

  describe('hideGroup()', function(){

    it('隐藏组元素',function(){
      form.hideGroup('apply')
      assert.deepEqual(form.getData() , {loginName: 'lmm0591', password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
      assert.isTrue($('[data-group="apply"]').hasClass('ui-form-element-invisible'))
    })

    it('隐藏组元素，并且不获取隐藏的字段的数据',function(){
      form.hideGroup('apply',1)
      assert.isTrue($('[data-group="apply"]').hasClass('ui-form-element-invisible'))
      assert.deepEqual(form.getData() , { loginName: 'lmm0591', password: '123', approve: '1' })
      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="apply_max"]')
      })
      assert.isFalse(isExis)
    })

    xit('隐藏组元素，并且不验证隐藏的字段的数据',function(){

    })

    xit('隐藏组元素，并且不验证，不获取隐藏的字段的数据',function(){

    })

  })

  describe('setSkip()', function(){
    it('正常访问',function(){
      form.setSkip('loginName',0)
      assert.deepEqual(form.getData() , {loginName: 'lmm0591', password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="loginName"]')
      })
      assert.isTrue(isExis)
    })

    it('忽略数据',function(){
      assert.equal(form.setSkip('loginName',1))
      assert.isUndefined(form.getData().loginName)
      assert.equal(form.getValue('loginName') , 'lmm0591')

      var isExis = form.getElements().some(function(element){
        return element === document.querySelector('[name="loginName"]')
      })
      assert.isFalse(isExis)

    })
  })

  it('setField() 改修字段信息', function() {
    form.setField('loginName', {
      value: '新名字',
      attrs: {
        disabled : 'disabled',
        placeholder: '年龄'
      }
    })

    assert.equal(form.$('[name="loginName"]').val(), '新名字')
    assert.equal(form.$('[name="loginName"]').attr('disabled'), 'disabled')
  })

  it('addField() 设置字段信息', function() {
    form.addField({
      name: 'age',
      value: '25',
      attrs: {
        placeholder: '年龄'
      }
    })

    assert.equal(form.$('[name="age"]').val(),'25')
  })

  it('removeField()',function(){
    form.removeField('loginName')
    assert.deepEqual(form.getData() , { password: '123', approve: '1', 'apply_max': '', 'apply_min': ''})
    assert.isNull(document.querySelector('[name="loginName"]'))
  })


  afterEach(function() {
    form.destroy()
    $('#main').remove()
  })
})
