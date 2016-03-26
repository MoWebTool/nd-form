'use strict'

var $ = require('nd-jquery')
//var debug = require('debug')
var Form = require('../../index')

var chai = require('chai')
var sinonChai = require('sinon-chai')
var assert = chai.assert
chai.use(sinonChai)
var sinon = window.sinon

describe('测试 Form 组件的 Event',function(){
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
      }],
      buttons: [{
        label:'登录',
        type: 'submit',
        role: 'form-submit'
      },{
        label:'取消',
        role: 'form-cancel'
      }],
      parentNode: '#main'
    })
  })

  it('监听 formSubmit 事件', function() {

    var formSubmitFn = sinon.spy(function(data) {
      assert.deepEqual(data,{loginName: 'lmm0591' })
    })

    var submitFn = sinon.spy()

    form.on('formSubmit', formSubmitFn).render()

    $(form.element).on('submit', submitFn)

    $('button[type="submit"]', form.element).click()
    assert.isTrue(formSubmitFn.calledOnce)
    assert.isTrue(submitFn.notCalled)

  })


  it('监听 formCancel 事件', function() {
    var formCancelFn = sinon.spy(function() {
      return false
    })
    form.on('formCancel', formCancelFn).render()

    $('button[data-role="form-cancel"]', form.element).click()
    assert.isTrue(formCancelFn.calledOnce)
  })


  afterEach(function(){
    $('#main').remove()
  })
})
