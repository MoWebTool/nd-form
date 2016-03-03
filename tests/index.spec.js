'use strict'

// var $ = require('nd-jquery')
var chai = require('chai')
var sinonChai = require('sinon-chai')
var Form = require('../index')

var expect = chai.expect
// var sinon = window.sinon

chai.use(sinonChai)

/*globals describe,it*/

describe('Form', function() {

  it('new Form', function() {
    expect(Form).to.be.a('function')
    expect(new Form).to.be.a('object')
  })

})
