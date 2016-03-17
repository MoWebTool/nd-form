var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var pkg = require('../package.json')
console.log(path.join(__dirname,'../index.tmpl'))
module.exports = {
  name: 'client',
  target: 'web',
  devtool: 'source-map',
  entry: 'index.js',
  resolve: {
    root: path.join(__dirname,'../')
  },
  plugins:[
    new HtmlWebpackPlugin({
      template: './config/index.tmpl',
      hash: true,
      filename: 'index.html',
      inject: true,
      minify: {
        //collapseWhitespace: true,
        //minifyJS: true
      },
      title: pkg.description,
      appname: pkg.name,
      version: pkg.version,
      author: pkg.author,
      timestamp: Date.now(),
      description: pkg.description
    })
  ],
  module: {
    loaders: [
      { test: /\.handlebars$/, loader: 'handlebars-loader' }
    ]
  },
  output: {
    path:'./dest',
    filename: pkg.name + '.js'
  }
}
