# nd-form

[![spm version](http://spmjs.io/badge/nd-form)](http://spmjs.io/package/nd-form)

> 1.x, 专注于做 form，不再集成 validator、ajax、placeholder，改为插件方式实现。

## 安装

```bash
$ spm install nd-form --save
```

## 使用

```js
var Form = require('nd-form');
// use Form
```
## 开发

### 本地 Web 服务

```bash
grunt
```

浏览器中访问 http://127.0.0.1:8851

### 生成/查看 API 文档

```bash
grunt doc
grunt
```

浏览器中访问 http://127.0.0.1:8851/doc

### 代码检查与单元测试

```bash
grunt test
```

### 发布组件到 SPM 源

```bash
grunt publish
```
