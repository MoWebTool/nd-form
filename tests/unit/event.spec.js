'use strict'

var $ = require('nd-jquery')
var Form = require('../../index')
//var debug = require('debug')

describe('测试组件的 event',function(){
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

  xit('formSubmit', function(){
    form.getData()
  })

  xit('formCancel', function(){

  })


  afterEach(function(){
    $('#main').remove()
  })
})


