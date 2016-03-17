var $ = require('nd-jquery')
var Form = require('../../index');
//var debug = require('debug');

describe('(app) home',function(){
  var form;

  beforeEach(function(){
    $('<div id="main"/>').appendTo('body');
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
      }],
      // 配置按钮
      buttons: [{
        label: '登录',
        type: 'submit',
        role: 'form-submit'
      }],
      parentNode: '#main'
    }).render();
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

  it('getElements()', function(){
    var data = form.getData()
    expect(form.$('[name="loginName"]').val()).toEqual('lmm0591')
    expect(data.loginName).toEqual('lmm0591')
  })

  afterEach(function(){
    $('#main').remove()
  })
})
