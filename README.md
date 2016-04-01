# nd-form

[![Travis](https://img.shields.io/travis/ndfront/nd-form.svg?style=flat-square)](https://github.com/ndfront/nd-form)
[![Coveralls](https://img.shields.io/coveralls/ndfront/nd-form/doc.svg?style=flat-square)](https://github.com/ndfront/nd-form)
[![NPM version](https://img.shields.io/npm/v/nd-form.svg?style=flat-square)](https://npmjs.org/package/nd-form)

> 集成了 nd-formdata 与 nd-queue 的表单。

## 安装

```bash
$ npm install nd-form --save -r https://registry.npm.taobao.org
```

## 命令说明

1 执行测试用例

```shell
npm test 
```

2 生成使用文档

```shell
npm run doc 
```

3 打包 JS 文件

```shell
npm run pack 
```

## 目录说明

```
ND-FORM
├─config ------ karma，webpack, doc 的配置文件
├─src --------- handlebars 的模板
├─tests ------- 测试
├─tests\unit ---------- TDD测试
├─tests\stories ------- BDD测试，描述一些测试故事
├─docs -------- 运行 npm run doc 后生成的说明文档
├─dist -------- 运行 npm run pack 打包好的可部署文件
└─index.js ---- 组件主源码

```

## 依赖技术

- [webpack](http://webpack.github.io/) 组件的打包工具
- [karma](https://karma-runner.github.io/) JavaScript 测试管理工具（Test Runner）
- [phantomjs](http://phantomjs.org/) 基于 WebKit 的服务器端的浏览
- [mocha](http://mochajs.org/) JS的测试框架
- [isparta](https://github.com/douglasduteil/isparta) 代码测试覆盖工具
- [eslint](http://eslint.org/) 编码规范检查，有效控制代码质量
- [handlebars](http://handlebarsjs.com/) js的模板引擎


## 使用

```js
var Form = require('nd-form');
var Validator = require('nd-validator');
var md5s = require('nd-md5s');

// use Form
new Form({
  className: 'ui-form-login',
  
  // 更多 plugins，见 nd-form-extra
  plugins: [Validator],

  fields: [{
    icon: 'user-o',
    name: 'login_name',
    attrs: {
      placeholder: '帐号',
      maxlength: 41,
      required: 'required',
      pattern: '^[_0-9a-zA-Z]{1,20}@[_0-9a-zA-Z]{1,20}$',
      'data-display': '帐号'
    },
    messages: {
      pattern: '格式：用户@组织'
    }
  }, {
    icon: 'lock-o',
    name: 'password',
    type: 'password',
    attrs: {
      placeholder: '密码',
      maxlength: 32,
      required: 'required',
      'data-display': '密码'
    }
  }],

  // 配置按钮
  buttons: [{
    label: '登录',
    type: 'submit',
    role: 'form-submit'
  }],

  // 处理 attrs.formData
  inFilter: function(data) {
    // do something
    return data;
  },

  // 处理待提交到服务端的数据
  outFilter: function(data) {
    // 对密码进行加密
    var salt = '<salt>';
    data.password = md5s(data.password, salt);
    return data;
  },

  // 绑定一些事件，继承自 widget
  events: {
    'focus [name="password"]': function() {
      util.$('#container')
          .addClass('focused');
    },
    'blur [name="password"]': function() {
      util.$('#container')
          .removeClass('focused');
    }
  },

  parentNode: '#main'
})
// 登录按钮的事件回调
.on('formSubmit', function(data) {
  // do something, like post data to server
})
.render();
```
